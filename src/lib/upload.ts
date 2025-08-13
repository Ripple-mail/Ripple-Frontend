import { createReadStream, statSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const chunkSize = 1024 * 1024;

export default async function uploadFile(file: File | null) {
    
}