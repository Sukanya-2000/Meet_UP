import api from './api';

const getPhotos = async () => (await api.get('/photos')).data;
const uploadPhotos = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));
  return (await api.post('/photos/upload', formData, {
    headers: { 'Content-Type': undefined },
  })).data;
};
const deletePhoto = async (id) => (await api.delete(`/photos/${id}`)).data;
const setMainPhoto = async (id) => (await api.put(`/photos/main/${id}`)).data;
const reorderPhotos = async (photoIds) => (await api.put('/photos/reorder', { photoIds })).data;

export default { getPhotos, uploadPhotos, deletePhoto, setMainPhoto, reorderPhotos };
