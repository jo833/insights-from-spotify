import { UserProfile } from "@spotify/web-api-ts-sdk";
import { getAccessToken, redirectToAuthCodeFlow } from "./authCodeFlow";
import { client_id } from "./secret"; // env does not work
const clientId = client_id;
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
  redirectToAuthCodeFlow(clientId);
} else {
  const accessToken = await getAccessToken(clientId, code);
  const profile = await fetchProfile(accessToken);
  const topTrack = await getTopTracks(accessToken);
  const formattedTopTracks = await formatTopTracks(topTrack);
  const topTrackImg = await getTopTracksImg(topTrack);
  const topArtists = await getTopArtists(accessToken);
  const topArtistsImg = await getTopArtistsImg(topArtists);
  const formattedTopArtists = await formatTopArtists(topArtists);
  populateUI(
    profile,

    topTrackImg,
    formattedTopTracks,
    topArtistsImg,
    formattedTopArtists
  );
}

async function fetchProfile(token: string): Promise<UserProfile> {
  try {
    const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return await result.json();
  } catch (err) {
    throw new Error(`Failure to fetch Profile`);
  }
}
async function getTopTracks(token: string) {
  try {
    const results = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=5",
      { method: "GET", headers: { Authorization: `Bearer ${token}` } }
    );
    return (await results.json()).items;
  } catch (err) {
    throw new Error(`Failure to fetch Top Tracks`);
  }
}

function getTopTracksImg(topTracks: any) {
  if (topTracks === undefined || topTracks.length == 0) {
    throw new Error("Unable to get Top Tracks Images");
  }
  let results = topTracks.map(
    (track: { album: { images: { url: string }[] } }) =>
      track.album.images[0].url
  );
  return results;
}

function formatTopTracks(topTracks: any) {
  if (topTracks === undefined || topTracks.length == 0) {
    throw new Error(`Unable to format Top Tracks`);
  }
  let results = topTracks.map(
    (track: { name: any; artists: { name: string }[] }) =>
      " " + track.name + " by " + track.artists[0].name
  );
  return results;
}

async function getTopArtists(token: string) {
  try {
    const results = await fetch(
      "https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=5",
      { method: "GET", headers: { Authorization: `Bearer ${token}` } }
    );
    return (await results.json()).items;
  } catch (err) {
    throw new Error(`Unable to fetch Top Artists`);
  }
}

function getTopArtistsImg(topArtists: any) {
  if (topArtists === undefined || topArtists.length == 0) {
    throw new Error(`Unable to get Top Artists Images`);
  }
  let results = topArtists.map(
    (artist: { images: { url: string }[] }) => artist.images[0].url
  );
  return results;
}

function formatTopArtists(topArtists: any) {
  if (topArtists === undefined || topArtists.length == 0) {
    throw new Error(`Unable to format Top Artists`);
  }
  let results = topArtists.map((artist: { name: any }) => " " + artist.name);
  return results;
}

function populateUI(
  profile: UserProfile,
  topTracksImg: any,
  topTracks: any,
  topArtistsImg: any,
  topArtists: any
) {
  document.getElementById("displayName")!.innerText = profile.display_name;
  if (profile.images[0]) {
    const profileImage = new Image(200, 200);
    profileImage.src = profile.images[0].url;
    document.getElementById("avatar")!.appendChild(profileImage);
  }
  document.getElementById("id")!.innerText = profile.id;
  document.getElementById("email")!.innerText = profile.email;
  document.getElementById("uri")!.innerText = profile.uri;
  document
    .getElementById("uri")!
    .setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url")!.innerText = profile.href;
  document.getElementById("url")!.setAttribute("href", profile.href);
  document.getElementById("imgUrl")!.innerText =
    profile.images[0]?.url ?? "(no profile image)";
  let i = 1;
  while (i < 6) {
    document.getElementById("track" + i + "name")!.innerText = topTracks[i - 1];
    document.getElementById("artist" + i + "name")!.innerText =
      topArtists[i - 1];
    (<HTMLImageElement>document.getElementById("trackImg" + i))!.src =
      topTracksImg[i - 1];
    (<HTMLImageElement>document.getElementById("artist" + i))!.src =
      topArtistsImg[i - 1];
    i++;
  }
}
