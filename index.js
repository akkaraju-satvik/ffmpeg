const ffmpeg = require('fluent-ffmpeg');
const { promises: fsPromises } = require('fs');
const { basename, join } = require('path');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

const FOLDERS = {
  INPUT: './inputs',
  OUTPUT: './outputs',
}

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

function mergeAudioAndVideo(audio, video) {
  return new Promise((resolve, reject) => {
    const output = join(FOLDERS.OUTPUT, basename(video));
    ffmpeg()
      .input(audio)
      .input(video)
      .aspectRatio('16:9')
      .output(output)
      .on('end', () => resolve(output))
      .on('error', reject)
      .on('progress', progress => console.log(progress.percent + '% done'))
      .run();
  });
}

async function main() {
  const audio = join(FOLDERS.INPUT, 'RTc415cafaa327c4295e94a17b0a838143.mka');
  const video = join(FOLDERS.INPUT, 'RTb12dd52ff5156d2616fc32897a84ba8d.mkv');
  const output = await mergeAudioAndVideo(audio, video);
  console.log(output);
}

main();