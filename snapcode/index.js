(function () {

  'use strict';

  const processSnapCode = function (event, context) {

    const gm = require('gm').subClass({ imageMagick: true }),
      AWS = require('aws-sdk'),
      async = require('async'),
      _ = require('lodash');
    const S3 = new AWS.S3();

    const MAGIC_FUZZ = "53%"; // woooo magic numbers! 53% was found via guess and check to work the best

    const bucket = event.Records[0].s3.bucket.name;
    const srcKey = decodeURIComponent(event.Records[0].s3.object.key).replace(/\+/g, ' ');

    let filename = srcKey.split('/').reverse()[0];
    let destKey = 'snapcodes/' + filename;


    function getImage(next) {
      console.log('getting image...');
      S3.getObject({ Bucket: bucket, Key: srcKey }, (err, data) => {
        if (err)
          console.log('Error getting object');

        if (err)
          next(err);
        else if (!data)
          next('getImage no data');
        else
          next(null, data);
      });
    }


    function removeBackground(res, next) {
      console.log('removing background...');
      gm(res.Body)
        .fuzz(MAGIC_FUZZ)
        .transparent('#FFFFFF')
        .antialias()
        .toBuffer((err, buff) => {
          if (err)
            console.log('error converting image');

          if (err)
            next(err);
          else
            next(null, buff);
        });
    }


    function saveImage(buffer, next) {
      console.log('saving image...');

      S3.putObject({ Bucket: bucket, Key: destKey, Body: buffer, ContentType: 'image/png' }, (err, data) => {
        if (err)
          console.log('error saving image');

        if (err)
          next(err);
        else if (!data)
          next('saveImage no data');
        else
          next(null, data);
      });
    }


    function final(err, data) {
      if (err || (_.has(data, 'error') && data.error !== null)) {
        console.log('error saving', bucket + '/' + destKey);
        context.fail(err.stack);
      }
      else {
        console.log('successfully saved', bucket + '/' + destKey);
        context.succeed();
      }
    }


    async.waterfall([getImage, removeBackground, saveImage], final);

  };

  exports.handler = processSnapCode;

}).call(this);
