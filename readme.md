# 🔗 Simple URL Shortener Microservice (Affordmed Backend Test)


The solution for the problem statement — where the goal was to build a simple microservice that turns long URLs into short ones 

---



# process

-  Convert any long URL into a short link like `localhost:3000/testing`
-  Optionally choose your own custom shortcode (like `mycoollink`)
-  Set how long the link stays active (default is 30 minutes)
-  Redirect users to the original URL when they visit the short one
-  Track how many times it was clicked, from where, and when

---


## 📸 Screenshots

![Postman Screenshot](./screenshot-postman.png)
![Server Screenshot](./screenshot-server.png)




POST - `http://localhost:3000/shorturls` 



Send a JSON body like this in Postman:


```json
{
  "url": "https://example.com/very-long-url",
  "validity": 10,
  "shortcode": "para007"
}

