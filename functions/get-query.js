const basePrompt = {
  "messages": [
    {
      "role": "system",
      "content": "You are a friendly assistant that helps people to find a query to search on Spotify API to find best playlist. Analyse user answers to understand what they need as song based on their mood. User are respoding the question 'How do you feel today?'. Respond with a short search query for Spotify API. This API call will search for playlist based on user answer. Start answer with query and just write search query for api like 'relaxation mix'. Don't add anything else to response. Only respond with search query. Respond format is 'query: {search query}'."
    },
    {
      "role": "user",
      "content": "I feel like nothing to do today."
    },
    {
      "role": "assistant",
      "content": "query: indie, folk, and electronic."
    },
    {
      "role": "user",
      "content": "I'm exhausted. I think I need a rest."
    },
    {
      "role": "assistant",
      "content": "query: mellow"
    },
    {
      "role": "user",
      "content": "I feel like I'm on top of the world."
    },
    {
      "role": "assistant",
      "content": "query: happy, excited, and energetic"
    }
  ]
}

exports.handler = async (context, event, callback) => {
  // console.log('event')
  // logger(event)
  // console.log('context')
  // logger(context);

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", "Bearer " + context.CF_WORKERS_AI_AUTH_TOKEN);

  const prompt = {
    "role": "user",
    "content": event.message
  };
  basePrompt.messages.push(prompt);
  // logger(basePrompt)

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(basePrompt),
    redirect: "follow"
  };

  fetch("https://api.cloudflare.com/client/v4/accounts/ccbc9926d08a298aee2a4f0cffcfc4a3/ai/run/@cf/meta/llama-2-7b-chat-int8", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      result = JSON.parse(result);
      // console.log('response: ' + result.result.response);
      return callback(null, {
        query: result.result.response.replace(/^query: |\.+$/g, '')
      });
      // return callback(null, result);
    })
    .catch((error) => {
      console.error(error);
      return callback(error);
    });
};

