const fs = require("fs");
const path = require("path");

async function uploadImage(base64Image, id, folderName, isUser, host) {
  try {
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Format base64 invalide");
    }

    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");
    const uploadDir = path.join(
      __dirname,
      "..",
      "..",
      "public/",
      folderName,
      id,
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    } else {
    }
    //juste pour différencier comment on nomme l'image profile user et les images de l'etab
    let filename = "";
    if (isUser) {
      filename = `profileImg.${ext}`;
    } else {
      filename = `${Date.now()}.${ext}`;
    }
    const filepath = path.join(uploadDir, filename);
    try {
      fs.writeFileSync(filepath, buffer);
    } catch (err) {
      console.error("Erreur d’écriture :", err);
    }

    const imageUrl = `http://${host}/public/${folderName}/${id}/${filename}`;
    console.log(`Image uploaded to: ${imageUrl}`);
    return imageUrl;
  } catch (err) {
    console.error("Erreur lors de l'upload de l'image :", err);
    throw err;
  }
}

module.exports = uploadImage;
