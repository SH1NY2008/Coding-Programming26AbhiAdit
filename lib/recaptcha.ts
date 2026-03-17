const isDev = process.env.NODE_ENV !== "production";

export const RECAPTCHA_SITE_KEY = isDev
  ? "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
  : process.env.RECAPTCHA_SITE_KEY;

export const RECAPTCHA_SECRET_KEY = isDev
  ? "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
  : process.env.RECAPTCHA_SECRET_KEY;
