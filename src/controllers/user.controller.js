import {asyncHandler} from "../utils/asyncHandler.js";


const registerUser = asyncHandler( async (req, res) => {
   // get user details from frontend
   // validation - not empty
   // check if user already exists: username, email
   // check for images, check for avatar
   // upload them on cloudinary, check avatar
   // create user object - create entry in db
   // remove password and refresh token field from response
   // check for user creation 
   // return response




//get details from frontend:
   const {fullName, email, username, password } = req.body
    console.log("email: ", email);


//validation     
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    
    //check if user already exists

    const existedUser = User.findOne({
        $or: [{ username}, { email}]
    })
    
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

//check for images, avatar






})

export {
    registerUser,
}