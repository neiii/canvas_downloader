interface LectureSlide {
  id: string;
  name: string;
  url: string;
}

function findLectureSlides(): LectureSlide[] {
  const slides: LectureSlide[] = [];
  const seenNames = new Map<string, LectureSlide>();
  const courseId = window.location.pathname.match(/\/courses\/(\d+)/)?.[1];

  if (!courseId) {
    return slides;
  }

  document.querySelectorAll('li[class*="Attachment_"]').forEach((element) => {
    const titleElement = element.querySelector('.item_name a.ig-title');
    if (!titleElement || !titleElement.textContent?.toLowerCase().trim().includes('.pdf')) return;
    
    const name = titleElement.textContent?.trim();
    if (!name) return;
    
    const attachmentId = element.className.match(/Attachment_(\d+)/)?.[1];
    if (!attachmentId) return;

    // Only store the first occurrence of a file name
    if (!seenNames.has(name)) {
      const slide = {
        id: attachmentId,
        name: name,
        url: `https://canvas.swansea.ac.uk/courses/${courseId}/files/${attachmentId}/download`
      };
      seenNames.set(name, slide);
      slides.push(slide);
    }
  });

  return slides;
}

function createDownloadUI(slides: LectureSlide[]) {
  // Remove existing UI if present
  const existingUI = document.getElementById('lecture-downloader');
  if (existingUI) {
    existingUI.remove();
  }

  const container = document.createElement('div');
  container.id = 'lecture-downloader';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 9999;
    width: 420px;
    max-height: 80vh;
    height: auto;
    font-family: system-ui, -apple-system, sans-serif;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    transform: translateY(40px);
    display: flex;
    flex-direction: column;
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  `;

  const title = document.createElement('h3');
  title.textContent = 'Lecture Slides';
  title.style.cssText = `
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
  `;

  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.cssText = `
    background: none;
    border: none;
    font-size: 24px;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
  `;
  closeButton.addEventListener('mouseover', () => {
    closeButton.style.backgroundColor = '#f0f0f0';
  });
  closeButton.addEventListener('mouseout', () => {
    closeButton.style.backgroundColor = 'transparent';
  });
  closeButton.addEventListener('click', () => {
    container.style.opacity = '0';
    container.style.transform = 'translateY(40px)';
    setTimeout(() => container.remove(), 300);
  });

  header.appendChild(title);
  header.appendChild(closeButton);
  container.appendChild(header);

  // Add search bar
  const searchContainer = document.createElement('div');
  searchContainer.style.cssText = `
    margin-bottom: 16px;
    position: relative;
  `;

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search slides or use /^CS_210_L\\d+\\.pdf$/';
  searchInput.style.cssText = `
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
    background-color: #f8f9fa;
    color: #333;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    letter-spacing: 0.2px;

    &::placeholder {
      color: #888;
      opacity: 0.8;
    }

    &:hover {
      border-color: #ccc;
      background-color: #fff;
    }

    &:focus {
      border-color: #0066cc;
      background-color: #fff;
      box-shadow: 0 2px 8px rgba(0,102,204,0.15);
    }
  `;

  const searchHelp = document.createElement('div');
  searchHelp.style.cssText = `
    font-size: 12px;
    color: #666;
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
  `;

  // Add info icon
  const infoIcon = document.createElement('span');
  infoIcon.innerHTML = '&#9432;'; // Info symbol
  infoIcon.style.cssText = `
    color: #0066cc;
    font-size: 14px;
  `;

  searchHelp.appendChild(infoIcon);
  searchHelp.appendChild(document.createTextNode('Use /pattern/ for regex search'));

  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(searchHelp);
  container.appendChild(searchContainer);

  // Add select all button
  const selectAllContainer = document.createElement('div');
  selectAllContainer.style.cssText = `
    margin-bottom: 16px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `;

  const selectAllButton = document.createElement('button');
  selectAllButton.textContent = 'Select All Lectures';
  selectAllButton.style.cssText = `
    background: #f8f9fa;
    color: #0066cc;
    border: 2px solid #0066cc;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);

    &:active {
      transform: translateY(1px);
    }
  `;

  // Add icon to button
  const selectIcon = document.createElement('span');
  selectIcon.innerHTML = '✓';
  selectIcon.style.cssText = `
    font-size: 16px;
    font-weight: bold;
  `;
  selectAllButton.prepend(selectIcon);

  let isAllSelected = false;
  
  // Add button hover and active states
  selectAllButton.addEventListener('mouseover', () => {
    selectAllButton.style.backgroundColor = '#f0f7ff';
  });
  selectAllButton.addEventListener('mouseout', () => {
    selectAllButton.style.backgroundColor = '#f8f9fa';
  });
  selectAllButton.addEventListener('mousedown', () => {
    selectAllButton.style.backgroundColor = '#e5f1ff';
  });
  selectAllButton.addEventListener('mouseup', () => {
    selectAllButton.style.backgroundColor = '#f0f7ff';
  });

  // Toggle functionality
  selectAllButton.addEventListener('click', () => {
    isAllSelected = !isAllSelected;
    
    if (isAllSelected) {
      selectAllButton.style.cssText = `
        background: #ebf5ff;
        color: #0052a3;
        border: 2px solid #0052a3;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);

        &:hover {
          background: #e5f1ff;
        }
      `;
      selectIcon.textContent = '✓';
      selectAllButton.textContent = 'Deselect All';
      selectAllButton.prepend(selectIcon);
    } else {
      selectAllButton.style.cssText = `
        background: #f8f9fa;
        color: #0066cc;
        border: 2px solid #0066cc;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);

        &:hover {
          background: #f0f7ff;
        }
      `;
      selectIcon.textContent = '✓';
      selectAllButton.textContent = 'Select All Lectures';
      selectAllButton.prepend(selectIcon);
    }

    // Update all visible checkboxes
    Array.from(list.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')).forEach(checkbox => {
      checkbox.checked = isAllSelected;
      if (isAllSelected) {
        checkbox.style.backgroundColor = '#0066cc';
        checkbox.style.borderColor = '#0066cc';
      } else {
        checkbox.style.backgroundColor = 'transparent';
        checkbox.style.borderColor = '#ddd';
      }
    });
  });

  selectAllContainer.appendChild(selectAllButton);
  container.appendChild(selectAllContainer);

  const list = document.createElement('div');
  list.style.cssText = `
    flex: 1;
    min-height: 300px;
    height: 300px;
    overflow-y: auto;
    margin-bottom: 16px;
    padding-right: 8px;
    background: white;
  `;

  // Custom scrollbar
  list.style.cssText += `
    scrollbar-width: thin;
    scrollbar-color: #ccc transparent;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #ccc;
      border-radius: 3px;
    }
  `;

  const items = slides.map(slide => {
    const item = document.createElement('div');
    item.style.cssText = `
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s ease;
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = slide.id;
    checkbox.id = `slide-${slide.id}`;
    
    // Custom checkbox styling
    checkbox.style.cssText = `
      appearance: none;
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border: 2px solid #ddd;
      border-radius: 4px;
      margin-right: 12px;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
    `;

    // Add custom checkbox check mark
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        this.style.backgroundColor = '#0066cc';
        this.style.borderColor = '#0066cc';
      } else {
        this.style.backgroundColor = 'transparent';
        this.style.borderColor = '#ddd';
      }
    });

    const label = document.createElement('label');
    label.htmlFor = `slide-${slide.id}`;
    label.textContent = slide.name;
    label.style.cssText = `
      font-size: 14px;
      color: #333;
      cursor: pointer;
      flex: 1;
    `;

    item.appendChild(checkbox);
    item.appendChild(label);

    // Hover effect for the entire row
    item.addEventListener('mouseover', () => {
      item.style.backgroundColor = '#f5f5f5';
    });
    item.addEventListener('mouseout', () => {
      item.style.backgroundColor = 'transparent';
    });

    return { item, slide };
  });

  // Add all items to the list initially
  items.forEach(({ item }) => list.appendChild(item));

  // Update search functionality to maintain list size
  let searchTimeout: number | null = null;
  searchInput.addEventListener('input', () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = window.setTimeout(() => {
      const query = searchInput.value.trim();
      let matcher: (text: string) => boolean;

      if (query.startsWith('/') && query.endsWith('/') && query.length > 2) {
        try {
          const regex = new RegExp(query.slice(1, -1), 'i');
          matcher = (text: string) => regex.test(text);
        } catch (e) {
          matcher = (text: string) => text.toLowerCase().includes(query.toLowerCase());
        }
      } else {
        matcher = (text: string) => text.toLowerCase().includes(query.toLowerCase());
      }

      // Clear the list but maintain size
      while (list.firstChild) {
        list.removeChild(list.firstChild);
      }

      // Reset select all button state
      isAllSelected = false;
      selectAllButton.style.cssText = `
        background: #f8f9fa;
        color: #0066cc;
        border: 2px solid #0066cc;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);

        &:hover {
          background: #f0f7ff;
        }
      `;
      selectIcon.textContent = '✓';
      selectAllButton.textContent = 'Select All Lectures';
      selectAllButton.prepend(selectIcon);

      // Filter and add matching items
      const matchingItems = items.filter(({ slide }) => !query || matcher(slide.name));
      
      if (matchingItems.length === 0 && query) {
        const noResults = document.createElement('div');
        noResults.style.cssText = `
          text-align: center;
          color: #666;
          padding: 20px;
          font-size: 14px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
        `;
        noResults.textContent = 'No matching slides found';
        list.appendChild(noResults);
      } else {
        matchingItems.forEach(({ item }) => {
          list.appendChild(item);
          item.style.display = 'flex';
        });
      }
    }, 300);
  });

  container.appendChild(list);

  // Add folder option
  const folderOption = document.createElement('div');
  folderOption.style.cssText = `
    margin-bottom: 16px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  `;

  const folderCheckboxContainer = document.createElement('div');
  folderCheckboxContainer.style.cssText = `
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  `;

  const folderCheckbox = document.createElement('input');
  folderCheckbox.type = 'checkbox';
  folderCheckbox.id = 'folder-option';
  folderCheckbox.style.cssText = `
    appearance: none;
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid #ddd;
    border-radius: 4px;
    margin-right: 12px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
  `;

  folderCheckbox.addEventListener('change', function() {
    if (this.checked) {
      this.style.backgroundColor = '#0066cc';
      this.style.borderColor = '#0066cc';
      folderNameInput.style.display = 'block';
    } else {
      this.style.backgroundColor = 'transparent';
      this.style.borderColor = '#ddd';
      folderNameInput.style.display = 'none';
    }
  });

  const folderLabel = document.createElement('label');
  folderLabel.htmlFor = 'folder-option';
  folderLabel.textContent = 'Create folder for downloads';
  folderLabel.style.cssText = `
    font-size: 14px;
    color: #333;
    cursor: pointer;
  `;

  folderCheckboxContainer.appendChild(folderCheckbox);
  folderCheckboxContainer.appendChild(folderLabel);
  folderOption.appendChild(folderCheckboxContainer);

  const folderNameInput = document.createElement('input');
  folderNameInput.type = 'text';
  folderNameInput.placeholder = 'Enter folder name';
  folderNameInput.style.cssText = `
    width: 100%;
    padding: 8px 12px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
    background-color: white;
    display: none;
    margin-top: 8px;

    &:focus {
      border-color: #0066cc;
      box-shadow: 0 2px 4px rgba(0,102,204,0.1);
    }
  `;

  folderOption.appendChild(folderNameInput);
  container.appendChild(folderOption);

  const downloadButton = document.createElement('button');
  downloadButton.textContent = 'Download Selected';
  downloadButton.style.cssText = `
    width: 100%;
    background: #0066cc;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
  `;

  downloadButton.addEventListener('mouseover', () => {
    downloadButton.style.backgroundColor = '#0052a3';
  });
  downloadButton.addEventListener('mouseout', () => {
    downloadButton.style.backgroundColor = '#0066cc';
  });

  downloadButton.addEventListener('click', () => {
    const selectedSlides = Array.from(list.querySelectorAll<HTMLInputElement>('input:checked')).map(checkbox => {
      const slide = slides.find(s => s.id === checkbox.value);
      return slide!;
    });

    if (selectedSlides.length === 0) {
      alert('Please select at least one lecture slide to download.');
      return;
    }

    const useFolder = folderCheckbox.checked;
    const folderName = folderNameInput.value.trim();

    if (useFolder && !folderName) {
      alert('Please enter a folder name.');
      folderNameInput.focus();
      return;
    }

    chrome.runtime.sendMessage({
      type: 'downloadSlides',
      slides: selectedSlides,
      useFolder: useFolder,
      folderName: folderName
    });
  });

  container.appendChild(downloadButton);
  
  // Update appear animation
  document.body.appendChild(container);
  requestAnimationFrame(() => {
    // Force a reflow to ensure the initial state is rendered
    container.getBoundingClientRect();
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
  });
}

function init() {
  if (!window.location.pathname.includes('/modules')) return;
  
  let slidesFound = setInterval(() => {
    let slides = findLectureSlides();
    if (slides.length > 0) {
      createDownloadUI(slides);
      clearInterval(slidesFound);
    }
  }, 700);
}

init(); 