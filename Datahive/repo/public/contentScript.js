console.log('🔌 Content Script Loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📩 Content Script received message:', message);

    if (message.action === 'extractData') {
        console.log('🔍 Starting data extraction for job:', message.job);
        const data = extractData(message.job);
        console.log('✅ Extraction complete. Data:', data);
        sendResponse(data);
    }
    return true; // Keep the message channel open for async response
});

function extractData(job) {
    console.group('📑 Data Extraction Process');

    const data = {
        title: document.title,
        url: window.location.href,
    };
    console.log('📌 Basic data:', { title: data.title, url: data.url });

    if (job.extractImages) {
        data.images = Array.from(document.images)
            .map(img => ({
                src: img.src,
                alt: img.alt,
                width: img.width,
                height: img.height
            }));
        console.log('🖼️ Extracted images:', data.images.length, 'images found');
    }

    if (job.extractLinks) {
        data.links = Array.from(document.links)
            .map(link => ({
                href: link.href,
                text: link.textContent.trim(),
                title: link.title
            }));
        console.log('🔗 Extracted links:', data.links.length, 'links found');
    }

    if (job.extractText) {
        data.text = document.body.innerText;
        console.log('📝 Extracted text length:', data.text.length, 'characters');
    }

    if (job.extractMetadata) {
        data.metadata = {
            description: getMetaContent('description'),
            keywords: getMetaContent('keywords'),
            ogTitle: getMetaContent('og:title'),
            ogDescription: getMetaContent('og:description'),
            ogImage: getMetaContent('og:image')
        };
        console.log('📋 Extracted metadata:', data.metadata);
    }

    console.groupEnd();
    return data;
}

function getMetaContent(name) {
    const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    const content = meta ? meta.content : null;
    console.log(`🏷️ Meta ${name}:`, content);
    return content;
}