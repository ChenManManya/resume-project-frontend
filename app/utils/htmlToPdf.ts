// 页面导出为 pdf 格式
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const waitForImages = async (element: HTMLElement) => {
  const images = Array.from(element.querySelectorAll('img'))

  await Promise.all(
    images.map((image) => {
      if (image.complete) {
        return Promise.resolve()
      }

      return new Promise<void>((resolve) => {
        const done = () => {
          image.removeEventListener('load', done)
          image.removeEventListener('error', done)
          resolve()
        }

        image.addEventListener('load', done, { once: true })
        image.addEventListener('error', done, { once: true })
      })
    })
  )
}

const htmlToPdf = {
  async getPdf(title: string, id: string) {
    if (!import.meta.client) {
      return
    }

    const target = document.getElementById(id)

    if (!(target instanceof HTMLElement)) {
      throw new Error(`htmlToPdf: element '#${id}' not found`)
    }

    if ('fonts' in document) {
      await document.fonts.ready
    }

    await waitForImages(target)

    const scale = 2

    const canvas = await html2canvas(target, {
      allowTaint: false,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff',
      scale,
      width: target.scrollWidth,
      height: target.scrollHeight,
      windowWidth: target.scrollWidth,
      windowHeight: target.scrollHeight,
      onclone: (clonedDocument) => {
        const clonedTarget = clonedDocument.getElementById(id)

        if (!(clonedTarget instanceof HTMLElement)) {
          return
        }

        clonedTarget.style.margin = '0'
        clonedTarget.style.boxShadow = 'none'
        clonedTarget.style.transform = 'none'

        clonedDocument.querySelectorAll('.drag-handle, .ghost, .test-tools').forEach((node) => {
          if (node instanceof HTMLElement) {
            node.style.display = 'none'
          }
        })
      }
    })

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('htmlToPdf: failed to get canvas context')
    }

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const a4w = pageWidth - margin * 2
    const a4h = pageHeight - margin * 2
    const imgHeight = Math.floor((a4h * canvas.width) / a4w)
    let renderedHeight = 0

    while (renderedHeight < canvas.height) {
      const page = document.createElement('canvas')
      const pageHeight = Math.min(imgHeight, canvas.height - renderedHeight)
      const pageCtx = page.getContext('2d')

      if (!pageCtx) {
        throw new Error('htmlToPdf: failed to get page canvas context')
      }

      page.width = canvas.width
      page.height = pageHeight

      pageCtx.putImageData(
        ctx.getImageData(0, renderedHeight, canvas.width, pageHeight),
        0,
        0
      )

      pdf.addImage(
        page.toDataURL('image/jpeg', 1.0),
        'JPEG',
        margin,
        margin,
        a4w,
        Math.min(a4h, (a4w * page.height) / page.width)
      )

      renderedHeight += imgHeight

      if (renderedHeight < canvas.height) {
        pdf.addPage()
      }
    }

    pdf.save(`${title}.pdf`)
  }
}

export default htmlToPdf
