interface LectureSlide {
  id: string;
  name: string;
  url: string;
}

interface DownloadMessage {
  type: 'downloadSlides';
  slides: LectureSlide[];
  useFolder: boolean;
  folderName: string;
}

chrome.runtime.onMessage.addListener((message: DownloadMessage) => {
  if (message.type === 'downloadSlides') {
    message.slides.forEach(slide => {
      chrome.downloads.download({
        url: slide.url,
        filename: message.useFolder ? `${message.folderName}/${slide.name}` : slide.name,
        saveAs: false
      });
    });
  }
}); 