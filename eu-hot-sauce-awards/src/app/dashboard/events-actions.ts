'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function getEvents() {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return data;
}

export async function createEvent(formData: FormData) {
  const supabase = createClient(cookies());

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const eventDate = formData.get('event_date') as string;
  const eventTime = formData.get('event_time') as string;
  const endDate = formData.get('end_date') as string;
  const endTime = formData.get('end_time') as string;
  const location = formData.get('location') as string;
  const venue = formData.get('venue') as string;
  const url = formData.get('url') as string;
  const featured = formData.get('featured') === 'on';
  const imageFile = formData.get('image') as File | null;

  let imageUrl = null;

  // Upload image if provided
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { success: false, error: `Image upload failed: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);

    imageUrl = publicUrl;
  }

  const { error } = await supabase.from('events').insert({
    title,
    description: description || null,
    event_date: eventDate,
    event_time: eventTime || null,
    end_date: endDate || null,
    end_time: endTime || null,
    location: location || null,
    venue: venue || null,
    url: url || null,
    image_url: imageUrl,
    featured,
    active: true,
  });

  if (error) {
    console.error('Error creating event:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = createClient(cookies());

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const eventDate = formData.get('event_date') as string;
  const eventTime = formData.get('event_time') as string;
  const endDate = formData.get('end_date') as string;
  const endTime = formData.get('end_time') as string;
  const location = formData.get('location') as string;
  const venue = formData.get('venue') as string;
  const url = formData.get('url') as string;
  const featured = formData.get('featured') === 'on';
  const imageFile = formData.get('image') as File | null;

  let imageUrl: string | null | undefined = undefined;

  // Upload new image if provided
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { success: false, error: `Image upload failed: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);

    imageUrl = publicUrl;

    // Delete old image if exists
    const { data: existingEvent } = await supabase
      .from('events')
      .select('image_url')
      .eq('id', id)
      .single();

    if (existingEvent?.image_url) {
      const oldPath = existingEvent.image_url.split('/').pop();
      if (oldPath) {
        await supabase.storage.from('event-images').remove([oldPath]);
      }
    }
  }

  const updateData: any = {
    title,
    description: description || null,
    event_date: eventDate,
    event_time: eventTime || null,
    end_date: endDate || null,
    end_time: endTime || null,
    location: location || null,
    venue: venue || null,
    url: url || null,
    featured,
    updated_at: new Date().toISOString(),
  };

  // Only update image_url if a new image was uploaded
  if (imageUrl !== undefined) {
    updateData.image_url = imageUrl;
  }

  const { error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating event:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteEvent(id: string) {
  const supabase = createClient(cookies());

  // Get event to delete associated image
  const { data: event } = await supabase
    .from('events')
    .select('image_url')
    .eq('id', id)
    .single();

  // Delete the event
  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    return { success: false, error: error.message };
  }

  // Delete associated image if exists
  if (event?.image_url) {
    const imagePath = event.image_url.split('/').pop();
    if (imagePath) {
      await supabase.storage.from('event-images').remove([imagePath]);
    }
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function toggleEventActive(id: string, active: boolean) {
  const supabase = createClient(cookies());

  const { error } = await supabase
    .from('events')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error toggling event:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
