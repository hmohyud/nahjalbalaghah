'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react'
import './pdf-viewer.css'

const usePDF = () => {
  const [pdfComponents, setPdfComponents] = useState<any>(null)

  useEffect(() => {
    const loadPDF = async () => {
      const pdfjs = await import('pdfjs-dist')
      const { Document, Page } = await import('react-pdf')

      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

      setPdfComponents({ Document, Page, pdfjs })
    }

    loadPDF()
  }, [])

  return pdfComponents
}

interface PDFViewerProps {
  pdfUrl: string
  title?: string
}

export default function PDFViewer({ pdfUrl, title = 'PDF Document' }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [pageWidth, setPageWidth] = useState<number | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  const pdfComponents = usePDF()

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        setPageWidth(containerWidth - 16)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [isFullscreen])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages))
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.5))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5))
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const actualWidth = pageWidth ? pageWidth * scale : undefined

  if (!pdfComponents) {
    return (
      <div className="pdf-viewer__loading">
        <div className="pdf-viewer__loading-text">Loading PDF viewer...</div>
      </div>
    )
  }

  const { Document, Page } = pdfComponents

  return (
    <div className={isFullscreen ? 'pdf-viewer__container--fullscreen' : 'pdf-viewer__container'}>
      <div className="pdf-viewer__toolbar">
        <div className="pdf-viewer__toolbar-group">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="pdf-viewer__toolbar-btn"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <span className="pdf-viewer__page-info">
            Page {pageNumber} of {numPages || '...'}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="pdf-viewer__toolbar-btn"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="pdf-viewer__toolbar-group">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="pdf-viewer__toolbar-btn"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <span className="pdf-viewer__zoom-info">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 2.5}
            className="pdf-viewer__toolbar-btn"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="pdf-viewer__divider"></div>
          <button
            onClick={toggleFullscreen}
            className="pdf-viewer__toolbar-btn"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className={isFullscreen ? 'pdf-viewer__content--fullscreen' : 'pdf-viewer__content'}
      >
        <div className="pdf-viewer__content-inner">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="pdf-viewer__doc-status">
                <div className="pdf-viewer__loading-text">Loading PDF...</div>
              </div>
            }
            error={
              <div className="pdf-viewer__doc-status">
                <div className="pdf-viewer__error-text">Failed to load PDF. Please try again.</div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              width={actualWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="pdf-viewer__page"
            />
          </Document>
        </div>
      </div>
    </div>
  )
}
