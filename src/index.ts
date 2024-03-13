interface CompressedImage {
  file: File;
  imgSrc: string;
}
const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

export const compressImage = (files: File): Promise<CompressedImage> => {
  return new Promise(resolve => {
    const reader = new FileReader();
    const img = new Image();
    let base64: string, size: number;
    const imgName = files?.name || 'test';
    img.onload = () => {
      const maxWidth = 1080;
      const quality = 0.9;
      const canvas = document.createElement('canvas');
      const drawer = canvas.getContext('2d')!;

      const originWidth = img.width;
      const originHeight = img.height;
      const ratio = originHeight / originWidth;
      const canvasHeight = ratio * maxWidth;

      canvas.width = maxWidth;
      canvas.height = canvasHeight;
      drawer.drawImage(img, 0, 0, canvas.width, canvas.height);

      const canvasBase64 = canvas.toDataURL('image/jpeg', quality);
      if (size >= 1024 * 2) {
        base64 = base64.length < canvasBase64.length ? base64 : canvasBase64;
      }
      resolve({ file: dataURLtoFile(base64, imgName), imgSrc: base64 });
    };
    reader.readAsDataURL(files);
    reader.onload = (event: ProgressEvent<FileReader>) => {
      base64 = event.target!.result as string;
      img.src = base64;
      size = Math.ceil(event.total! / 1024);
    };
  });
};
