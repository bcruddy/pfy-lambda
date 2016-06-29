###A collection of Lambda Functions for various tasks at Photofy.

###SnapCode
Lambda function for removing the white background from a an image (in this case a Snapchat snapcode).
Trigger's are set up to run the function when a new photo is saved to a '/raw' directory and the 
final result is saved back to the '/raw' directory's parent.
