import React, { useState } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/webpack';

// Worker 경로 설정
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js`
const Doc = () => {
    const [file, setFile] = useState(null);
    
    const handleFileChange = (event) => {
      setFile(event.target.files[0]);
    };

 const getDocs = async (id) => {
        if (!id) {
            alert("There's no docs ID!");
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:8080/docs/${id}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',  // 올바른 Content-Type 설정
                    // 추가 헤더가 필요하면 여기서 설정
                },
            });
            console.log(response);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            // const blob = await response.blob();
            // console.log(blob.type); 
            // const url = window.URL.createObjectURL(blob);
            const data = await response.json(); // Base64 데이터를 JSON으로 파싱
            const base64String = data.file;
    
            // PDF 뷰어를 위한 div 생성
            const pdfViewer = document.createElement('div');
            pdfViewer.style.width = '100%';
            pdfViewer.style.height = '600px';
            document.body.appendChild(pdfViewer);
    
            // Blob 객체 생성
            const byteCharacters = atob(base64String);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
    
            // PDF 문서 로딩
            const loadingTask = getDocument(url);
            loadingTask.promise.then(pdf => {
                console.log('PDF loaded');
    
                // 첫 번째 페이지를 가져옵니다.
                pdf.getPage(4).then(page => {
                    console.log('Page loaded');
    
                    const scale = 1.5;
                    const viewport = page.getViewport({ scale: scale });
    
                    // PDF를 렌더링할 캔버스 생성
                    const canvas = document.createElement('canvas');
                    pdfViewer.appendChild(canvas);
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
    
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };
                    page.render(renderContext);
                });
            }).catch(error => {
                console.error('Error loading PDF:', error);
            });
    
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };
    const handleFetchDoc = () => {
        const docs_id = "1"; // 여기에서 파일 ID를 설정하세요.
        getDocs(docs_id);
    };


    const handleUpload = async () => {
        if (!file) {
          alert("Please select a file first!");
          return;
        }
      
        const formData = new FormData();
        formData.append("docs", file);
      
        try {
   
          const response = await fetch("http://localhost:8080/docs", {
            method: "POST",
            body: formData,
          })
          if (response.ok) {
            alert("File uploaded successfully!");
          } else {
            alert("Failed to upload file.");
          }
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      };
      
  
    return (
        <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
        <button onClick={handleFetchDoc}>업로드파일 보기 </button>
      </div>
    );
}

export default Doc