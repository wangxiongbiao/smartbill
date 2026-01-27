import { createClient } from './supabase/client';
import { ImageUpload, ImageType } from '../types';

/**
 * Save a new image upload record
 */
export async function saveImageUpload(
    userId: string,
    imageType: ImageType,
    imageData: string,
    fileName?: string,
    fileSize?: number
): Promise<ImageUpload> {
    const supabase = createClient();

    const payload = {
        user_id: userId,
        image_type: imageType,
        image_data: imageData,
        file_name: fileName,
        file_size: fileSize,
        updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('image_uploads')
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error('Error saving image upload:', error);
        throw error;
    }

    return data as ImageUpload;
}

/**
 * Get user's image upload history by type
 */
export async function getUserImageUploads(
    userId: string,
    imageType: ImageType
): Promise<ImageUpload[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('image_uploads')
        .select('*')
        .eq('user_id', userId)
        .eq('image_type', imageType)
        .order('created_at', { ascending: false })
        .limit(20); // Limit to most recent 20 uploads

    if (error) {
        console.error('Error fetching image uploads:', error);
        throw error;
    }

    return (data as ImageUpload[]) || [];
}

/**
 * Delete an image upload record
 */
export async function deleteImageUpload(uploadId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from('image_uploads')
        .delete()
        .eq('id', uploadId);

    if (error) {
        console.error('Error deleting image upload:', error);
        throw error;
    }
}
