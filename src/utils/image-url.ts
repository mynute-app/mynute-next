/**
 * Converte URLs do Cloudflare R2 interno para o domínio público
 * @param url URL da imagem (pode ser R2 ou storage.mynute.app)
 * @returns URL acessível publicamente
 */
export function getPublicImageUrl(
  url: string | undefined | null
): string | null {
  if (!url) return null;

  console.log("🔍 URL original:", url);
  if (url.includes("storage.mynute.app")) {
    const cleanedUrl = url.replace(/\/mynute-app\//g, "/");
    console.log("✅ URL limpa:", cleanedUrl);
    return cleanedUrl;
  }

  if (url.includes(".r2.cloudflarestorage.com")) {
    const match = url.match(/\/mynute-app\/(.+)$/);
    if (match) {
      const publicUrl = `https://storage.mynute.app/${match[1]}`;
      console.log("✅ URL convertida do R2:", publicUrl);
      return publicUrl;
    }
  }
  console.log("➡️ URL mantida:", url);
  return url;
}
