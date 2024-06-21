const querystring = require('querystring');

exports.handler = async (context, event, callback) => {

    let accessToken = await getAccessToken(context);
    // console.log("accessToken: " + accessToken);
    console.log("query in event: " + event.query);

    const myHeaders = new Headers();
    myHeaders.append("authorization", "Bearer " + accessToken);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    const query = querystring.stringify({
        q: event.query,
        type: 'playlist',
        market: 'US',
        limit: 5,
        offset: 0
    });
    console.log("query: " + query);

    fetch("https://api.spotify.com/v1/search?" + query, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result);
            result = JSON.parse(result);
            const itemHrefs = result.playlists.items.map(item => item.external_urls.spotify);
            const hrefList = itemHrefs.join('\n');
            return callback(null, {
                list: hrefList
            });
        })
        .catch((error) => {
            console.error(error);
            return callback(error);
        });
};

async function getAccessToken(context) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    const username = context.SPOTIFY_CLIENT_ID;
    const password = context.SPOTIFY_CLIENT_SECRET;
    const authString = `${username}:${password}`;
    const encodedAuthString = Buffer.from(authString).toString('base64');
    myHeaders.append("Authorization", `Basic ${encodedAuthString}`);

    const urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "client_credentials");

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
    };

    try {
        const response = await fetch("https://accounts.spotify.com/api/token", requestOptions);
        const result = await response.json();
        const accessToken = result.access_token;
        return accessToken;
    } catch (error) {
        console.error(error);
    }
}
