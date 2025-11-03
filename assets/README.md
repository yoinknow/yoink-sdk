# Assets Directory

This directory contains images and assets for the Yoink SDK documentation.

## Logo

The Yoink logo (`yoinknow.png`) should be placed in this directory.

### To add the logo:

**From Windows:**
1. Copy the logo from: `D:\LiveStreams\Frontend\frontend_livestream\public\yoinknow.png`
2. Use WinSCP, FileZilla, or similar to transfer to this Linux directory
3. Destination: `/home/memewhales/smart_livestreams/yoink-sdk/assets/yoinknow.png`

**From Linux/WSL:**
```bash
# If you have access to the Windows drive via WSL
cp /mnt/d/LiveStreams/Frontend/frontend_livestream/public/yoinknow.png /home/memewhales/smart_livestreams/yoink-sdk/assets/

# Or using scp
scp user@windows-machine:/path/to/yoinknow.png /home/memewhales/smart_livestreams/yoink-sdk/assets/
```

### Image Specifications

- **File name**: `yoinknow.png`
- **Recommended size**: 200-400px width (displays at 200px in README)
- **Format**: PNG (with transparency preferred)
- **Used in**: 
  - README.md (header)
  - GitHub repository preview
  - NPM package page

### Current Status

- [ ] Logo file copied to this directory
- [x] README.md updated to reference logo
- [x] package.json includes assets in published files

Once the logo is copied, the README will display it correctly on GitHub and NPM.
