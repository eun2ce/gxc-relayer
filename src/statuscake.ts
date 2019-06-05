const https = require('https');

export default function SCPush() {
   return https.get( process.env.STATUSCAKE_API_KEY, function(response) {
        response.on('end', function() {
          console.log('Completed StatusCake Push');
        });
    });
}
