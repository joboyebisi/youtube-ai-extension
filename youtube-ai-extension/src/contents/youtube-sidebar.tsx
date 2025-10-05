import { useEffect, useState } from "react"

import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetStyle, PlasmoMountShadowHost } from "plasmo"

import SidebarApp from "../components/sidebar-app"
import cssText from "data-text:~/style.css"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"],
  all_frames: false
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `:host{all:initial}\n${cssText}`
  return style
}

const selectors = [
  "#secondary.style-scope.ytd-watch-flexy",
  "ytd-watch-flexy #secondary",
  "#related.style-scope.ytd-watch-flexy",
  "#secondary",
  "ytd-watch-flexy #secondary-inner",
  "#secondary-inner",
  "ytd-watch-flexy #related",
  "#related"
]

const findSecondaryColumn = (): HTMLElement | null => {
  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element instanceof HTMLElement) {
      return element
    }
  }
  return null
}

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  const existing = findSecondaryColumn()
  if (existing) {
    return existing
  }

  return new Promise<Element>((resolve) => {
    let attempts = 0
    const maxAttempts = 100
    
    const poll = () => {
      const next = findSecondaryColumn()
      if (next) {
        resolve(next)
        return
      }
      
      attempts++
      if (attempts < maxAttempts) {
        requestAnimationFrame(poll)
      } else {
        // Fallback: create a container div if we can't find the secondary column
        const fallback = document.createElement('div')
        fallback.id = 'youtube-ai-chat-fallback'
        fallback.style.cssText = 'position: fixed; top: 20px; right: 20px; width: 400px; height: 600px; z-index: 9999;'
        document.body.appendChild(fallback)
        resolve(fallback)
      }
    }

    poll()
  })
}

export const mountShadowHost: PlasmoMountShadowHost = ({ shadowHost, anchor }) => {
  if (anchor?.element instanceof Element) {
    anchor.element.insertAdjacentElement("afterbegin", shadowHost)
  }
}

export const getShadowHostId = () => "youtube-ai-chat-extension"

const getVideoIdFromLocation = () => {
  const params = new URLSearchParams(window.location.search)
  return params.get("v") || null
}

const Sidebar = () => {
  const [videoId, setVideoId] = useState<string | null>(() => getVideoIdFromLocation())

  useEffect(() => {
    let lastId = getVideoIdFromLocation()

    const handleNavigation = () => {
      const nextId = getVideoIdFromLocation()
      if (nextId !== lastId) {
        lastId = nextId
        setVideoId(nextId)
      }
    }

    window.addEventListener("yt-navigate-finish", handleNavigation)
    const interval = window.setInterval(handleNavigation, 2000)

    return () => {
      window.removeEventListener("yt-navigate-finish", handleNavigation)
      window.clearInterval(interval)
    }
  }, [])

  return (
    <SidebarApp videoId={videoId} />
  )
}

export default Sidebar
