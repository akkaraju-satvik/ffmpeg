const ffmpeg = require('fluent-ffmpeg');
const { promises: fsPromises } = require('fs');
const { basename, join } = require('path');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

const FOLDERS = {
  INPUT: './inputs',
  OUTPUT: './outputs',
};

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

function mergeAudioAndVideo(audio, video) {
  return new Promise((resolve, reject) => {
    const output = join(FOLDERS.OUTPUT, basename('mergeAudioAndVideo.mkv'));
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

function createBlankVideo() {
  return new Promise((resolve, reject) => {
    const output = join(FOLDERS.OUTPUT, 'createBlankVideo.mkv');
    ffmpeg()
      .input('color=black:s=1280x720')
      .inputFormat('lavfi')
      .inputOptions(['-t', '10'])
      .outputOptions('-c:v libx264')
      .outputOptions('-pix_fmt yuv420p')
      .output(output)
      .on('end', () => resolve(output))
      .on('error', reject)
      .on('progress', progress => console.log(progress.percent + '% done'))
      .run();
  });
}

function createBlankVideoWithAudio(audio) {
  return new Promise((resolve, reject) => {
    const output = join(FOLDERS.OUTPUT, 'createBlankVideoWithAudio.mkv');
    ffmpeg()
      .input(audio)
      .input('color=black:s=1280x720')
      .inputFormat('lavfi')
      .inputOptions(['-t', '10'])
      .outputOptions('-c:v libx264')
      .outputOptions('-pix_fmt yuv420p')
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
  console.log(output, 'mergeAudioAndVideo');
  const blankVideo = await createBlankVideo();
  console.log(blankVideo, 'createBlankVideo');
  const blankVideoWithAudio = await createBlankVideoWithAudio(audio);
  console.log(blankVideoWithAudio, 'createBlankVideoWithAudio');
  
}

main();