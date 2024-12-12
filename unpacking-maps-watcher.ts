import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chokidar from 'chokidar';
import { writeFile, unlink } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputDir = join(__dirname, 'input', 'data');
const outputDir = join(__dirname, 'output', 'data');

const filterMapKeys = (data: string, filename: string) => {
   const file = JSON.parse(data);
   const mapId = filename?.replace(/\D/g, '');
   const mapData = {
      mapId: parseInt(mapId),
      topNeighbourId: file.mapData.topNeighbourId,
      bottomNeighbourId: file.mapData.bottomNeighbourId,
      leftNeighbourId: file.mapData.leftNeighbourId,
      rightNeighbourId: file.mapData.rightNeighbourId,
      backgroundElements: file.mapData.backgroundElements,
      foregroundElements: file.mapData.foregroundElements,
      sorteableElements: file.mapData.sorteableElements,
      animatedElements: file.mapData.animatedElements,
      refractionElements: file.mapData.refractionElements,
      interactiveElements: file.mapData.interactiveElements,
      boundingBoxes: file.mapData.boundingBoxes,
      backgroundMaterialData: file.mapData.backgroundMaterialData,
      foregroundMaterialData: file.mapData.foregroundMaterialData,
      sorteableMaterialData: file.mapData.sorteableMaterialData,
      cellsData: file.mapData.cellsData,
      localizedSounds: file.mapData.localizedSounds,
   };
   writeFile(join(outputDir, mapId + '.json'), JSON.stringify(mapData, null, 3));
   console.log(`Updated ${filename}`);
};

const readJSONFile = async (file: string) => {
   const filename = file.split(/\\|\//g).pop();
   if (!filename) return;

   try {
      const fileStream = createReadStream(file, { encoding: 'utf-8' });
      const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

      let data = '';
      for await (const line of rl) {
         console.log(line);
         if (line.includes('"references": {')) {
            data = data.trimEnd().slice(0, -1) + '}';
            break;
         }
         data += line;
      }
      filterMapKeys(data, filename);
      unlink(file).catch(err => console.error(`Error deleting ${filename}`, err));
   } catch (err) {
      console.error(`Error processing ${filename}`, err);
   }
};

chokidar.watch(inputDir, { persistent: true }).on('add', readJSONFile);
console.log('Watching for map files in', inputDir);
