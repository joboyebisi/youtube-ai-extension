const { readFileSync, writeFileSync } = require("fs")
const { join } = require("path")

const DEV_OUTPUT_DIR = join(__dirname, "build", "chrome-mv3-dev")
const PROD_OUTPUT_DIR = join(__dirname, "build", "chrome-mv3-prod")
const DEV_MANIFEST_PATH = join(DEV_OUTPUT_DIR, "manifest.json")
const PROD_MANIFEST_PATH = join(PROD_OUTPUT_DIR, "manifest.json")

const desiredPermissions = [
  "storage",
  "tabs",
  "scripting",
  "contextMenus",
  "activeTab"
]

const requiredHostPermissions = [
  "https://www.youtube.com/*",
  "http://localhost:*/*",
  "https://localhost:*/*"
]

const ensureUnique = (values = []) => [...new Set(values)].sort()

const removePopupArtifacts = (manifest) => {
  if (manifest.action) {
    delete manifest.action.default_popup
  }

  if (manifest.browser_action) {
    delete manifest.browser_action.default_popup
  }

  if (Array.isArray(manifest.web_accessible_resources)) {
    manifest.web_accessible_resources = manifest.web_accessible_resources.filter((entry) => {
      if (Array.isArray(entry.resources)) {
        entry.resources = entry.resources.filter(
          (resource) => !resource.toLowerCase().includes("popup")
        )
      }

      return entry.resources?.length
    })
  }
}

const enforceContentScripts = (manifest) => {
  if (!Array.isArray(manifest.content_scripts)) {
    return
  }

  manifest.content_scripts = manifest.content_scripts.map((script) => ({
    ...script,
    matches: ["https://www.youtube.com/*"],
    all_frames: false,
    match_about_blank: false
  }))
}

const fixManifest = (manifestPath) => {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))

  manifest.name = "YouTube AI Chat"
  manifest.description =
    "Chat with YouTube videos using AI powered by Cerebras and Llama 4. Extract transcripts and ask intelligent questions."
  manifest.version = manifest.version || "0.0.1"
  manifest.author = "YouTube AI Chat"
  manifest.manifest_version = 3

  manifest.permissions = ensureUnique([
    ...(manifest.permissions || []),
    ...desiredPermissions
  ])

  manifest.host_permissions = ensureUnique([
    ...(manifest.host_permissions || []),
    ...requiredHostPermissions
  ])

  // Remove CSP to use Plasmo defaults
  if (manifest.content_security_policy) {
    delete manifest.content_security_policy
  }

  removePopupArtifacts(manifest)
  enforceContentScripts(manifest)

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  return manifestPath
}

const main = () => {
  try {
    fixManifest(DEV_MANIFEST_PATH)
    console.log("Dev manifest updated successfully")
  } catch (error) {
    console.log("Dev manifest not found or failed to update:", error.message)
  }

  try {
    fixManifest(PROD_MANIFEST_PATH)
    console.log("Prod manifest updated successfully")
  } catch (error) {
    console.log("Prod manifest not found or failed to update:", error.message)
  }
}

try {
  main()
} catch (error) {
  console.error("Failed to update manifest", error)
  process.exitCode = 1
}
