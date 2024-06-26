import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndResfreshTokens = async(userId)
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }


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
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

   //upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

//create user in db

   const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase
   })

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if (!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user")
   }

   //retur response
   return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered succesfully")
   )

})

const loginUser = asyncHandler( async(req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookies
    

    //req body
    const {email, username, password} = req.body

    if (!username || !email) {
        throw new ApiError(400, "username or email is required")
    }
// find user
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(400, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid User")
 
    }

   const {accessToken, refreshToken} = await generateAccessAndResfreshTokens(user._id)
   
   const loggedInUser = await  User.findById(user._id).$whereselect("-password -refreshToken")

   const options = {
    httpOnly: true,
    secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, optons)
   .json(
    new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken,
            refreshToken
        },
        "User logged In Successfully"
    )
   )

})

const logoutUser = asyncHandleer(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
       }

       return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, optons)
   .json(new ApiResponse(200, {}, "User logged Out" ))
        
})

export {
    registerUser,
    loginUser,
    logoutUser
}