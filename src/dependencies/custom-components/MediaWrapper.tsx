import React from 'react'

export const getExtension = (filename: string) => filename.substring(filename.lastIndexOf('.') + 1, filename.length) ||
filename

export const mediaWrapper = ({src, htmlHeight, htmlWidth, ...props}:{src: string, htmlHeight?: string, htmlWidth?: string}) => {

  // const {htmlWidth, htmlHeight} = props
  
  /* TODO assign type to htmlWidth, htmlHeight */
  const document = {
    width: htmlWidth || "100%",
    height: htmlHeight || "100%",
  }

  const isVideoProvider = (src: string) => {
    /* Detect YouTube and Vimeo url videos */
    const regex = /(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/g
    return regex.test(src)
  }

  const ext = !isVideoProvider(src) ? getExtension(src) : 'html'

  const PreparedMedia = () => {

    switch (ext) {
      case 'mp4': 
      case 'webm': 
      return  <video 
        width={document.width} 
        controls
        preload='none'
        poster="images/videocover.png"
        >
        <source src={src} type={`video/${ext}`} />
          </video>  
      case 'pdf':
        return  <object
          type="application/pdf"
          data={src}
          role={'document'}
          width={document.width}
          height={document.height}
          ></object> 
      case 'doc': 
      case 'docx': 
      case 'xls': 
      case 'xlsx': 
      return <iframe
        title={src}
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${src}`}
        width={htmlWidth}
        height={htmlHeight}
        frameBorder="0"
        allowFullScreen
      >
      </iframe>  
      case 'txt': 
      case 'html': 
        return <iframe
        loading='lazy'
        title={src}
        src={src}
        width={htmlWidth}
        height={htmlHeight}
        allowFullScreen
      >
      </iframe>  
      default:
        return <img 
          loading="lazy"
          src={src} 
          width={document.width}
          height={document.height} 
          alt="" 
          />
    }
  } 

  return <PreparedMedia {...props} />
}

