import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://career-application-jy07.onrender.com/api'

const COMPANIES = [
  'TCS',
  'Infosys',
  'Wipro',
  'HCL',
  'Cognizant',
  'Capgemini',
  'Accenture',
  'Microsoft',
  'Amazon',
  'Google',
]

const initialForm = {
  name: '',
  rollNo: '',
  dob: '',
  phone: '',
  email: '',
  address: '',
  department: 'CSE',
  gender: 'Male',
  year: '1st Year',
  section: 'A',
  blacklogs: '0',
}

function App() {
  const [page, setPage] = useState(1)
  const [adminView, setAdminView] = useState(false)
  const [formData, setFormData] = useState(initialForm)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [message, setMessage] = useState('')
  const [registrations, setRegistrations] = useState(() => {
    const saved = localStorage.getItem('studentRegistrations')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('studentRegistrations', JSON.stringify(registrations))
  }, [registrations])

  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        const response = await fetch(`${API_URL}/registrations`)

        if (!response.ok) {
          return
        }

        const data = await response.json()

        if (Array.isArray(data) && data.length > 0) {
          setRegistrations(data)
        }
      } catch (error) {
        console.error('Failed to load registrations from server:', error)
      }
    }

    loadRegistrations()
  }, [])

  const isEligibleForNextPage = Number(formData.blacklogs) === 0

  const companyGroups = useMemo(() => {
    const groups = Object.fromEntries(COMPANIES.map((company) => [company, []]))

    registrations.forEach((student) => {
      student.selectedCompanies.forEach((company) => {
        if (groups[company]) {
          groups[company].push(student)
        }
      })
    })

    return groups
  }, [registrations])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCompanySelection = (companyName) => {
    setSelectedCompanies((prev) => {
      if (prev.includes(companyName)) {
        return prev.filter((company) => company !== companyName)
      }

      if (prev.length >= 4) {
        return prev
      }

      return [...prev, companyName]
    })
  }

  const handleNextStep = () => {
    if (!isEligibleForNextPage) {
      setMessage('Only students with zero backlogs can continue to the company preference page.')
      return
    }

    setMessage('')
    setPage(2)
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault()

    if (selectedCompanies.length !== 4) {
      setMessage('Please select exactly 4 companies from the list.')
      return
    }

    const studentRecord = {
      ...formData,
      selectedCompanies,
      submittedAt: new Date().toLocaleString(),
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentRecord),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to register student.')
      }

      const savedStudent = await response.json()

      setRegistrations((prev) => [savedStudent, ...prev])
      setFormData(initialForm)
      setSelectedCompanies([])
      setPage(1)
      setMessage('Registration submitted successfully!')
      setAdminView(true)
    } catch (error) {
      console.error('Registration error:', error)
      setMessage(error.message || 'Something went wrong while saving the student data.')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Campus Placement Portal</p>
          <h1>Student Registration</h1>
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setAdminView(false)}
            data-active={!adminView}
          >
            Student Form
          </button>
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setAdminView(true)}
            data-active={adminView}
          >
            Admin View
          </button>
        </div>
      </header>

      {message && <div className="alert-box">{message}</div>}

      {!adminView ? (
        <main className="form-card">
          <div className="step-indicator" aria-label="Registration steps">
            <span className={page === 1 ? 'active' : ''}>1</span>
            <span className={page === 2 ? 'active' : ''}>2</span>
          </div>

          {page === 1 ? (
            <form className="student-form" onSubmit={(event) => event.preventDefault()}>
              <div className="section-heading">
                <h2>Personal Details</h2>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>Name</span>
                  <input name="name" value={formData.name} onChange={handleInputChange} required />
                </label>

                <label className="field">
                  <span>Roll No</span>
                  <input name="rollNo" value={formData.rollNo} onChange={handleInputChange} required />
                </label>

                <label className="field">
                  <span>Date of Birth</span>
                  <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} required />
                </label>

                <label className="field">
                  <span>Phone Number</span>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
                </label>

                <label className="field full-width">
                  <span>Email ID</span>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                </label>

                <label className="field full-width">
                  <span>Address</span>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" required />
                </label>

                <label className="field">
                  <span>Department</span>
                  <select name="department" value={formData.department} onChange={handleInputChange}>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="IT">IT</option>
                  </select>
                </label>

                <label className="field">
                  <span>Gender</span>
                  <select name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className="field">
                  <span>Year</span>
                  <select name="year" value={formData.year} onChange={handleInputChange}>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </label>

                <label className="field">
                  <span>Section</span>
                  <select name="section" value={formData.section} onChange={handleInputChange}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </label>

                <label className="field">
                  <span>Number of Backlogs</span>
                  <input
                    type="number"
                    name="blacklogs"
                    min="0"
                    value={formData.blacklogs}
                    onChange={handleInputChange}
                    required
                  />
                </label>
              </div>

              <div className="eligibility-note">
                {isEligibleForNextPage ? (
                  <p className="success-text">Zero backlog detected. You can continue to the next page.</p>
                ) : (
                  <p className="warning-text">Backlogs found. Only students with zero backlog can proceed to company selection.</p>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="primary-btn" onClick={handleNextStep} disabled={!isEligibleForNextPage}>
                  Continue to Company Preferences
                </button>
              </div>
            </form>
          ) : (
            <form className="student-form" onSubmit={handleFormSubmit}>
              <div className="section-heading">
                <h2>Select 4 MNC Companies</h2>
              </div>

              <div className="company-grid">
                {COMPANIES.map((company) => {
                  const selected = selectedCompanies.includes(company)

                  return (
                    <button
                      key={company}
                      type="button"
                      className={`company-chip ${selected ? 'selected' : ''}`}
                      onClick={() => handleCompanySelection(company)}
                    >
                      {company}
                    </button>
                  )
                })}
              </div>

              <div className="selection-summary">
                Selected: <strong>{selectedCompanies.length}</strong> / 4 companies
              </div>

              <div className="form-actions split-actions">
                <button type="button" className="secondary-btn" onClick={() => setPage(1)}>
                  Back
                </button>
                <button type="submit" className="primary-btn">
                  Register Student
                </button>
              </div>
            </form>
          )}
        </main>
      ) : (
        <main className="admin-panel">
          <div className="section-heading">
            <h2>Admin: Registrations by Company</h2>
          </div>

          <div className="company-summary-grid">
            {COMPANIES.map((company) => (
              <div key={company} className="company-summary-card">
                <h3>{company}</h3>
                <p>{companyGroups[company]?.length || 0} students</p>
              </div>
            ))}
          </div>

          <div className="admin-list">
            {COMPANIES.map((company) => {
              const students = companyGroups[company] || []

              return (
                <div key={company} className="company-group">
                  <h3>{company}</h3>

                  {students.length === 0 ? (
                    <p className="empty-state">No students registered for this company.</p>
                  ) : (
                    <ul>
                      {students.map((student, index) => (
                        <li key={`${student.rollNo}-${student.email}-${index}`}>
                          <span>{student.name}</span>
                          <span>{student.rollNo}</span>
                          <span>{student.department}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </main>
      )}
    </div>
  )
}

export default App
