import buildError from '@ofa2/ofa2-error';

global.Errors = buildError({
  UnknownError: { code: 1, message: 'unknown error, need feedback' },
});
