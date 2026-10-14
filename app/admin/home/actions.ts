'use server';
import {requireAdmin} from '@/lib/admin-access';
import {adminSaveError} from '@/lib/admin-errors';
import {saveHomeConfig} from '@/lib/home-config.server';
import {revalidatePath} from 'next/cache';
export async function updateHome(input:unknown){try{await requireAdmin();const config=await saveHomeConfig(input);revalidatePath('/');revalidatePath('/admin/home');return {config};}catch(error){return {error:adminSaveError(error)};}}
