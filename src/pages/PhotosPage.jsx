import { Camera, Crown, GripVertical, ImagePlus, LogOut, Star, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import LoadingButton from '../components/LoadingButton';
import useAuth from '../hooks/useAuth';
import photoService from '../services/photoService';
import { getApiError } from '../utils/apiError';

export default function PhotosPage() {
  const [photos, setPhotos] = useState([]);
  const [state, setState] = useState({ loading: true, error: '', dragging: false });
  const inputRef = useRef(null);
  const draggedIndex = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const load = useCallback(async () => {
    try {
      const data = await photoService.getPhotos();
      setPhotos(data.photos);
      setState((value) => ({ ...value, loading: false }));
    } catch (error) {
      setState({ loading: false, error: getApiError(error), dragging: false });
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const upload = async (files) => {
    const selected = [...files].filter((file) => file.type.startsWith('image/')).slice(0, 6 - photos.length);
    if (!selected.length) return;
    setState((value) => ({ ...value, loading: true, error: '', dragging: false }));
    try { await photoService.uploadPhotos(selected); await load(); }
    catch (error) { setState({ loading: false, error: getApiError(error), dragging: false }); }
  };
  const remove = async (id) => {
    setState((value) => ({ ...value, loading: true, error: '' }));
    try { await photoService.deletePhoto(id); await load(); }
    catch (error) { setState({ loading: false, error: getApiError(error), dragging: false }); }
  };
  const setMain = async (id) => {
    setState((value) => ({ ...value, loading: true, error: '' }));
    try { await photoService.setMainPhoto(id); await load(); }
    catch (error) { setState({ loading: false, error: getApiError(error), dragging: false }); }
  };
  const dropCard = async (targetIndex) => {
    const sourceIndex = draggedIndex.current;
    if (sourceIndex === null || sourceIndex === targetIndex) return;
    const reordered = [...photos];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setPhotos(reordered);
    draggedIndex.current = null;
    try { await photoService.reorderPhotos(reordered.map((photo) => photo._id)); }
    catch (error) { setState((value) => ({ ...value, error: getApiError(error) })); await load(); }
  };
  const signOut = () => { logout(); navigate('/'); };

  return (
    <>
      <div className="flex items-start justify-between">
        <div><p className="text-sm font-semibold text-pink-300">STEP 3 OF 3</p><h1 className="mt-1 text-3xl">Show your spark</h1></div>
        <button onClick={signOut} className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white"><LogOut size={18} /></button>
      </div>
      <p className="mt-2 text-white/50">Add up to six photos. Drag cards to reorder them.</p>
      <div className="mt-6"><Alert>{state.error}</Alert></div>

      <div onDragOver={(event) => { event.preventDefault(); setState((value) => ({ ...value, dragging: true })); }} onDragLeave={() => setState((value) => ({ ...value, dragging: false }))} onDrop={(event) => { event.preventDefault(); upload(event.dataTransfer.files); }} className={`mt-5 rounded-2xl border-2 border-dashed p-5 text-center transition ${state.dragging ? 'border-pink-400 bg-pink-500/10' : 'border-white/15 bg-white/[.025]'}`}>
        <ImagePlus className="mx-auto text-pink-300" />
        <p className="mt-2 text-sm font-semibold">Drop photos here or <button type="button" onClick={() => inputRef.current?.click()} className="text-pink-300">browse</button></p>
        <p className="mt-1 text-xs text-white/35">JPG, PNG or WebP · 5 MB each · {6 - photos.length} slots left</p>
        <input ref={inputRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => upload(event.target.files)} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <div draggable onDragStart={() => { draggedIndex.current = index; }} onDragOver={(event) => event.preventDefault()} onDrop={() => dropCard(index)} key={photo._id} className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <img src={photo.imageUrl} alt={`Profile ${index + 1}`} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/90 to-transparent p-3 pt-12">
              <button type="button" onClick={() => setMain(photo._id)} className={`rounded-full p-2 ${photo.isMain ? 'bg-pink-500 text-white' : 'bg-black/50 text-white/70 hover:text-yellow-300'}`} title="Set main photo">{photo.isMain ? <Crown size={16} /> : <Star size={16} />}</button>
              <div className="flex gap-1"><span className="cursor-grab rounded-full bg-black/50 p-2 text-white/70"><GripVertical size={16} /></span><button type="button" onClick={() => remove(photo._id)} className="rounded-full bg-black/50 p-2 text-white/70 hover:text-rose-300"><Trash2 size={16} /></button></div>
            </div>
            {photo.isMain && <span className="absolute left-2 top-2 rounded-full bg-pink-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">Main</span>}
          </div>
        ))}
        {photos.length === 0 && <div className="col-span-full flex min-h-36 flex-col items-center justify-center rounded-2xl bg-white/[.03] text-white/30"><Camera /><p className="mt-2 text-sm">Your photos will appear here</p></div>}
      </div>
      <div className="mt-7"><LoadingButton type="button" isLoading={state.loading} onClick={() => navigate('/discover')}>{photos.length ? 'Start discovering' : 'Skip for now'}</LoadingButton></div>
    </>
  );
}
