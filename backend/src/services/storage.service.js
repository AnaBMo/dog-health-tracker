import { supabase } from '../index.js';

export const uploadFile = async (file, userId, dogId) => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${dogId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);

  return { filePath, publicUrl: urlData.publicUrl };
};

export const deleteFile = async (filePath) => {
  const { error } = await supabase.storage
    .from('documents')
    .remove([filePath]);

  if (error) throw new Error(error.message);
};