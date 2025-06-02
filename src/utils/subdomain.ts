/**
 * Gets the company ID from a subdomain
 * This can be used on the server side
 *
 * @param host The hostname from the request headers
 * @returns The company ID or null
 */
export async function getCompanyIdFromSubdomain(
  host: string
): Promise<string | null> {
  if (!host) return null;

  // Handle localhost development
  if (host.includes("localhost")) {
    // You might implement a different strategy for local development
    return null;
  }

  // Extract subdomain
  const parts = host.split(".");

  // If we have enough parts for a subdomain
  if (parts.length > 2) {
    const subdomain = parts[0];

    if (subdomain === "www") return null;

    // Here you would typically make an API call to get the company ID from the subdomain
    // For example:
    // const response = await fetch(`${process.env.BACKEND_URL}/subdomain/${subdomain}`);
    // const data = await response.json();
    // return data.companyId;

    // For now, we'll just return the subdomain as the ID
    return subdomain;
  }

  return null;
}
