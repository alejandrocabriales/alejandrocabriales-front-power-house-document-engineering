"use client"

import type React from "react"
import { User, Mail, Phone, MapPin, Calendar, MessageSquare, Camera } from "lucide-react"
import { DatePickerField, EmailField, FileField, Form, SelectField, StringField } from "@powerhousedao/document-engineering"
import { useRef, useState } from "react"
import axios from "axios"
import { UploadFile } from "../../../../document-model/document-engineering/dist/src/ui/components/data-entry/file-input/types"

// This should be in the .env file
const UPLOAD_URL = 'http://localhost:3001/file/upload' 

export default function PersonalInfoForm() {
  const controllerRef = useRef<AbortController | null>(null)

  const [status, setStatus] = useState<UploadFile>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (data: Record<string, unknown>) => {

    const file = (data.profilePicture as File | undefined)
    if (!file) {
      alert("Por favor, selecciona una foto de perfil.")
      return
    }
    setFile(file)
    setStatus('uploading')
    setProgress(0)
    setErrorMessage(null)

    const formData = new FormData()
    
    formData.append('file', file) 

    // const jsonData = { ...data, profilePicture: undefined } // Excluimos el archivo para no duplicarlo
    // formData.append('jsonData', JSON.stringify(jsonData))

    const controller = new AbortController()
    controllerRef.current = controller

    try {
      await axios.post(UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setProgress(percentCompleted)
          }
        },
      })

      setStatus('success')
      controllerRef.current = null

    } catch (err) {
      setStatus('error')
      controllerRef.current = null

      if (axios.isCancel(err)) {
        console.log("Upload cancelled by the user.")
        setStatus('idle')
      } else if (axios.isAxiosError(err)) {
        console.error("Error of Axios:", err.response?.data || err.message)
        setErrorMessage(err.response?.data?.message || "An error occurred while sending the form.")
        alert("An error occurred while sending the form.")
      } else {
        console.error("Unexpected error:", err)
        setErrorMessage("An unexpected error occurred.")
        alert("An unexpected error occurred.")
      }
    }
  }

  const isSubmitting = status === 'uploading';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl shadow-xl rounded-lg border-0 bg-white/80 backdrop-blur-sm">
        <div className="text-center space-y-2 pb-8 pt-8 px-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Personal Information
          </h1>
          <p className="text-lg text-gray-600">Please fill in your details below</p>
        </div>

        <div className="space-y-6 px-6 pb-8">
          <Form 
            onSubmit={handleSubmit} 
            className="space-y-6" 
            defaultValues={{
              profilePicture: null,
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              dateOfBirth: "",
              gender: "",
              address: "",
              bio: "",
            }} 
          >
            <div className="space-y-2">
              <label htmlFor="profilePicture" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <Camera className="w-4 h-4 text-indigo-500" />
                Profile Picture
              </label>
              <div className="w-[245px] -mt-4">
                <FileField
                  name="profilePicture"
                  description="Drop your file here"
                  maxFileSize={20000000} 
                  allowedFileTypes={["image/jpeg", "image/png", "image/jpg" , "application/pdf"]}
                  required
                  status={status}
                  progress={progress}
                  showPreview={false}
                  fileName={file?.name}
                  mimeType={file?.type}
                  fileSize={file?.size}
                  onCancel={() => {
                    setStatus('idle')
                    setProgress(0)
                    setErrorMessage(null)
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-blue-500" />
                  First Name
                </label>
                <StringField name="firstName" placeholder="Enter your first name" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <StringField name="lastName" placeholder="Enter your last name" required />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-green-500" />
                Email Address
              </label>
              <EmailField name="email" placeholder="Enter your email address" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-purple-500" />
                  Phone Number
                </label>
                <StringField name="phone" placeholder="Enter your phone number" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="dateOfBirth" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  Date of Birth
                </label>
                <DatePickerField name="dateOfBirth" autoClose required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <SelectField
                name="gender"
                required
                options={[
                  { value: "", label: "Select your gender" },
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                  { value: "prefer-not-to-say", label: "Prefer not to say" }
                ]}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-red-500" />
                Address
              </label>
              <StringField name="address" placeholder="Enter your full address" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <MessageSquare className="w-4 h-4 text-teal-500" />
                Bio (Optional)
              </label>
              <StringField multiline name="bio" placeholder="Tell us a little about yourself..." rows={4} />
            </div>
            
            {status === 'success' && <p className="text-green-600">¡Information saved successfully!</p>}
            {status === 'error' && <p className="text-red-600">{errorMessage}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg rounded-md shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Information
            </button>
          </Form>
        </div>
      </div>
    </div>
  )
}