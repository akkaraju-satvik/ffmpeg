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

// split video into 2 parts
const splitVideoInto2 = async (video) => {
  return new Promise((resolve, reject) => {

    const output1 = join(FOLDERS.INPUT, 'splitVideoInto2-1.mkv');
    const output2 = join(FOLDERS.INPUT, 'splitVideoInto2-2.mkv');
    ffmpeg()
      .input(video)
      .setStartTime('00:00:00')
      .setDuration('00:00:20')
      .output(output1)
      .on('end', () => {
        ffmpeg()
          .input(video)
          .setStartTime('00:00:20')
          .output(output2)
          .on('end', () => resolve([output1, output2]))
          .on('error', reject)
          .on('progress', progress => console.log(progress.percent + '% done'))
          .run();
      })
      .on('error', reject)
      .on('progress', progress => console.log(progress.percent + '% done'))
      .run();
  });
};

const join2VideosWith10SecondsGap = async (video1, video2, resolution) => {
  return new Promise((resolve, reject) => {
    const output = join(FOLDERS.OUTPUT, 'join2VideosWith10SecondsGap.mkv');
    ffmpeg()
      .input(video1)
      .input(`color=black:s=${resolution}`)
      .inputFormat('lavfi')
      .inputOptions(['-t', '10'])
      .input(video2)
      .complexFilter([
        '[0:v] [1:v] [2:v] concat=n=3:v=1 [v]',
      ], ['v'])
      .outputOptions('-c:v libx264')
      .outputOptions('-pix_fmt yuv420p')
      .output(output)
      .on('end', () => resolve(output))
      .on('error', reject)
      .on('progress', progress => console.log(progress.percent + '% done'))
      .run();
  });
};

const joinMultipleVideosWith10SecondsGap = async (videos, resolution) => {
  return new Promise((resolve, reject) => {
    const output = join(FOLDERS.OUTPUT, 'joinMultipleVideosWith10SecondsGap.mkv');
    const ffmpegCommand = ffmpeg();
    videos.forEach((video, index) => {
      ffmpegCommand.input(video);
      if (index !== videos.length - 1) {
        ffmpegCommand.input(`color=black:s=${resolution}`);
        ffmpegCommand.inputFormat('lavfi');
        ffmpegCommand.inputOptions(['-t', '10']);
      }
    });
    const complexFilter = ''
    for (let i = 0; i < (videos.length * 2) - 1; i++) {
      complexFilter.concat(`${i}:v `)
    };
    console.log(complexFilter);
    ffmpegCommand
      .complexFilter([
        `${complexFilter} concat=n=${videos.length + videos.length - 1}:v=1 [v]`,
      ], ['v'])
      .outputOptions('-c:v libx264')
      .outputOptions('-pix_fmt yuv420p')
      .output(output)
      .on('end', () => resolve(output))
      .on('error', reject)
      .on('progress', progress => console.log(progress.percent + '% done'))
      .run();
  });
};

const joinMultipleVideosWithUnequalTimeGap = async (videos, timeGaps, resolution) => {
  return new Promise((resolve, reject) => {
    const output = join(FOLDERS.OUTPUT, 'joinMultipleVideosWithUnequalTimeGap.mkv');
    const ffmpegCommand = ffmpeg();
    videos.forEach((video, index) => {
      ffmpegCommand.input(video);
      if (index !== videos.length - 1) {
        ffmpegCommand.input(`color=black:s=${resolution}`);
        ffmpegCommand.inputFormat('lavfi');
        ffmpegCommand.inputOptions(['-t', timeGaps[index]]);
      }
    });
    const complexFilter = ''
    for (let i = 0; i < (videos.length * 2) - 1; i++) {
      complexFilter.concat(`${i}:v `)
    };
    console.log(complexFilter);
    ffmpegCommand
      .complexFilter([
        `${complexFilter} concat=n=${videos.length + videos.length - 1}:v=1 [v]`,
      ], ['v'])
      .outputOptions('-c:v libx264')
      .outputOptions('-pix_fmt yuv420p')
      .output(output)
      .on('end', () => resolve(output))
      .on('error', reject)
      .on('progress', progress => console.log(progress.percent + '% done'))
      .run();
  });
}; 

async function main() {
  const audio = join(FOLDERS.INPUT, 'RTc415cafaa327c4295e94a17b0a838143.mka');
  const video = join(FOLDERS.INPUT, 'RTb12dd52ff5156d2616fc32897a84ba8d.mkv');
  const videoHalf1 = join(FOLDERS.INPUT, 'splitVideoInto2-1.mkv');
  const videoHalf2 = join(FOLDERS.INPUT, 'splitVideoInto2-2.mkv');
  // const output = await mergeAudioAndVideo(audio, video);
  // console.log(output, 'mergeAudioAndVideo');
  // const blankVideo = await createBlankVideo();
  // console.log(blankVideo, 'createBlankVideo');
  // const blankVideoWithAudio = await createBlankVideoWithAudio(audio);
  // console.log(blankVideoWithAudio, 'createBlankVideoWithAudio');
  ffmpeg.ffprobe(video, async (err, metadata) => {
    console.log(`${metadata.streams[0].width}x${metadata.streams[0].height}`, 'video resolution');
    const resolution = `${metadata.streams[0].width}x${metadata.streams[0].height}`;
    // const joinedMultipleVideosWith10SecondsGap = await joinMultipleVideosWith10SecondsGap([videoHalf1, videoHalf2, video], resolution);
    // console.log(joinedMultipleVideosWith10SecondsGap, 'join2VideosWith10SecondsGap');
    const joinedMultipleVideosWithUnequalTimeGap = await joinMultipleVideosWithUnequalTimeGap([videoHalf1, videoHalf2, video], [10, 5], resolution);
    console.log(joinedMultipleVideosWithUnequalTimeGap, 'joinMultipleVideosWithUnequalTimeGap');
  });
}

main();