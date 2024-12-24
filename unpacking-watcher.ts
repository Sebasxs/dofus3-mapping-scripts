import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';
import chokidar from 'chokidar';
import { createReadStream, writeFileSync, unlinkSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { setTimeout as sleep } from 'timers/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputDir = join(__dirname, 'map_bundles');
const outputDir = join(__dirname, 'map_data');

let isDeletingFiles = false;
const filesToDelete: string[] = [];

const addFileToDeleteQueue = async (path: string) => {
   filesToDelete.push(path);
   if (isDeletingFiles) return;

   isDeletingFiles = true;
   await sleep(30_000);

   while (filesToDelete.length > 0) {
      const file = filesToDelete.shift();
      if (!file) continue;
      try {
         unlinkSync(file);
      } catch (err) {
         await sleep(1_000);
         filesToDelete.push(file);
      }
   }

   isDeletingFiles = false;
};

const formatMapKeys = (data: string, mapId: string) => {
   const file = JSON.parse(data);
   const mapData = {
      mapId: parseInt(mapId),
      topNeighbourId: file.mapData.topNeighbourId,
      bottomNeighbourId: file.mapData.bottomNeighbourId,
      leftNeighbourId: file.mapData.leftNeighbourId,
      rightNeighbourId: file.mapData.rightNeighbourId,
      backgroundColor: file.mapData.backgroundColor.value,
      backgroundElements: file.mapData.backgroundElements,
      foregroundElements: file.mapData.foregroundElements,
      sortableElements: file.mapData.sortableElements,
      animatedElements: file.mapData.animatedElements,
      boundingBoxes: file.mapData.boundingBoxes,
      cellsData: file.mapData.cellsData,
   };
   writeFileSync(join(outputDir, mapId + '.json'), JSON.stringify(mapData, null, 3));
   console.log(`Updated map ${mapId}`);
};

const readJSONFile = async (file: string) => {
   const filename = basename(file);
   if (filename.startsWith('.')) return;

   let data = '';
   const mapId = filename?.replace(/\D/g, '');
   const fileStream = createReadStream(file, { encoding: 'utf-8' });
   const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

   try {
      for await (const line of rl) {
         if (line.includes('"references": {')) {
            data = data.trimEnd().slice(0, -1) + '}';
            break;
         }
         data += line;
      }

      data = data.replace(/"{3,}/g, '""');
      formatMapKeys(data, mapId);
      addFileToDeleteQueue(file);
   } catch (err) {
      console.error(`Error processing map: ${mapId}`, err);
      writeFileSync(join(outputDir, 'error_' + mapId + '.txt'), data);
   } finally {
      rl.close();
      fileStream.destroy();
   }
};

chokidar.watch(inputDir, { persistent: true }).on('add', readJSONFile);
console.log('Watching for map files in', inputDir);
