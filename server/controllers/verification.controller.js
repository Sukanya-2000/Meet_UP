import VerificationRequest from '../models/VerificationRequest.js';

export const createVerification = async (req, res) => {
  const existing = await VerificationRequest.findOne({ userId: req.user._id, status: 'pending' });
  if (existing) {
    res.status(409);
    throw new Error('A verification request is already pending');
  }
  const request = await VerificationRequest.create({
    userId: req.user._id,
    documentUrl: req.body.documentUrl || '',
    selfieUrl: req.body.selfieUrl || '',
    type: req.body.type || 'selfie',
    challenge: req.body.challenge || '',
    history: [{ status: 'pending', note: 'Verification submitted', actorId: req.user._id }],
  });
  res.status(201).json({ success: true, message: 'Verification request submitted', request });
};
export const getVerificationStatus = async (req,res)=>res.json({success:true,requests:await VerificationRequest.find({userId:req.user._id}).sort({createdAt:-1})});
export const retryVerification = async(req,res)=>{const previous=await VerificationRequest.findOne({_id:req.params.id,userId:req.user._id,status:'rejected'});if(!previous){res.status(404);throw new Error('Rejected verification not found');}if(previous.attempt>=3){res.status(429);throw new Error('Verification retry limit reached');}const request=await VerificationRequest.create({userId:req.user._id,documentUrl:req.body.documentUrl||previous.documentUrl,selfieUrl:req.body.selfieUrl||previous.selfieUrl,type:previous.type,attempt:previous.attempt+1,challenge:req.body.challenge||previous.challenge,history:[...previous.history,{status:'pending',note:'Verification retried',actorId:req.user._id}]});res.status(201).json({success:true,request});};
