import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chokidar from 'chokidar';
import { createReadStream, writeFileSync, unlinkSync } from 'node:fs';
import { createInterface } from 'node:readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputDir = join(__dirname, 'map_bundles');
const outputDir = join(__dirname, 'map_data');

const formatMapKeys = (data: string, filename: string) => {
   const file = JSON.parse(data);
   const mapId = filename?.replace(/\D/g, '');
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
      refractionElements: file.mapData.refractionElements,
      interactiveElements: file.mapData.interactiveElements,
      boundingBoxes: file.mapData.boundingBoxes,
      backgroundMaterialData: file.mapData.backgroundMaterialData,
      foregroundMaterialData: file.mapData.foregroundMaterialData,
      sortableMaterialData: file.mapData.sortableMaterialData,
      cellsData: file.mapData.cellsData,
      localizedSounds: file.mapData.localizedSounds,
   };
   writeFileSync(join(outputDir, mapId + '.json'), JSON.stringify(mapData, null, 3));
   console.log(`Updated ${filename}`);
};

const readJSONFile = async (file: string) => {
   const filename = file.split(/\\|\//g).pop();
   if (!filename || filename.startsWith('.')) return;

   let data = '';
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

      formatMapKeys(data, filename);
      unlinkSync(file);
   } catch (err) {
      console.error(`Error processing ${filename}`, err);
   } finally {
      rl.close();
      fileStream.destroy();
   }
};

chokidar.watch(inputDir, { persistent: true }).on('add', readJSONFile);
console.log('Watching for map files in', inputDir);
