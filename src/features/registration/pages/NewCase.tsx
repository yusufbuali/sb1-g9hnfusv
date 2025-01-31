import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Loader2, Plus, X, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';
import { Person } from '../../../types/auth';

interface FormData {
  // Case Info
  caseNumber: string;
  receivedDate: string;
  receivedTime: string;
  caseType: string;
  
  // Person Information
  persons: Person[];
  
  // Sender Details
  senderName: string;
  fromDept: string;
  policeNo: string;
  senderCaseNo: string;
  policeStation: string;
  submittedBy: string;
  submitterPoliceNo: string;
  
  // Department Details
  departmentName: string;
  personInCharge: string;
  sampleCount: number;
  sampleReceiver: string;
  expectedFinishDate: string;
  
  // Additional Info
  caseEnteredBy: string;
  priority: 'normal' | 'urgent';
  description: string;
}

const emptyPerson: Person = {
  name: '',
  cprNo: '',
  passportNo: '',
  gender: '',
  nationality: ''
};

const initialFormData: FormData = {
  // Case Info
  caseNumber: '',
  receivedDate: new Date().toISOString().split('T')[0],
  receivedTime: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
  caseType: '',
  
  // Person Information
  persons: [{ ...emptyPerson }],
  
  // Sender Details
  senderName: '',
  fromDept: '',
  policeNo: '',
  senderCaseNo: '',
  policeStation: '',
  submittedBy: '',
  submitterPoliceNo: '',
  
  // Department Details
  departmentName: '',
  personInCharge: '',
  sampleCount: 0,
  sampleReceiver: '',
  expectedFinishDate: '',
  
  // Additional Info
  caseEnteredBy: '',
  priority: 'normal',
  description: ''
};

const departments = ['Digital Forensics', 'Biology', 'Chemistry'];
const caseTypes = [
  'Homicide Investigation',
  'Cybercrime',
  'Drug Trafficking',
  'Financial Fraud',
  'Sexual Assault',
  'Missing Person',
  'Robbery',
  'Domestic Violence',
  'Child Abuse',
  'Other'
];

// Local storage key for form data
const FORM_STORAGE_KEY = 'newCaseFormData';

export default function NewCase() {
  const [formData, setFormData] = useState<FormData>(() => {
    // Try to load saved form data from local storage
    const savedData = localStorage.getItem(FORM_STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : initialFormData;
  });
  const [errors, setErrors] = useState<Partial<FormData> & { persons?: Partial<Person>[] }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Save form data to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Clear form data from local storage when the form is submitted successfully
  const clearSavedFormData = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> & { persons?: Partial<Person>[] } = {};
    const requiredFields: (keyof Omit<FormData, 'persons'>)[] = [
      'caseNumber',
      'receivedDate',
      'receivedTime',
      'caseType',
      'departmentName',
      'personInCharge',
      'sampleReceiver',
      'expectedFinishDate',
      'caseEnteredBy'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]?.toString().trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    // Validate persons
    const personErrors: Partial<Person>[] = [];
    let hasPersonErrors = false;

    formData.persons.forEach((person, index) => {
      const errors: Partial<Person> = {};
      if (!person.name.trim()) {
        errors.name = 'Name is required';
        hasPersonErrors = true;
      }
      personErrors[index] = errors;
    });

    if (hasPersonErrors) {
      newErrors.persons = personErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create the main case record
      const { error: caseError } = await supabase
        .from('cases')
        .insert({
          case_number: formData.caseNumber,
          title: formData.caseType,
          description: formData.description,
          status: 'new',
          priority: formData.priority,
          department: formData.departmentName,
          person_name: formData.persons.map(p => p.name).join(', '),
          sender_name: formData.senderName,
          from_dept: formData.fromDept,
          police_no: formData.policeNo,
          sender_case_no: formData.senderCaseNo,
          police_station: formData.policeStation,
          submitted_by: formData.submittedBy,
          submitter_police_no: formData.submitterPoliceNo,
          person_in_charge: formData.personInCharge,
          sample_count: formData.sampleCount,
          sample_receiver: formData.sampleReceiver,
          expected_finish_date: formData.expectedFinishDate,
          case_entered_by: formData.caseEnteredBy,
          received_date: formData.receivedDate,
          received_time: formData.receivedTime,
          created_by: user?.id,
          persons: formData.persons
        });

      if (caseError) {
        throw new Error(caseError.message);
      }

      // Clear saved form data after successful submission
      clearSavedFormData();
      navigate('/cases');
    } catch (err) {
      console.error('Error creating case:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to create case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePersonChange = (index: number, field: keyof Person, value: string) => {
    setFormData(prev => ({
      ...prev,
      persons: prev.persons.map((person, i) => 
        i === index ? { ...person, [field]: value } : person
      )
    }));
  };

  const addPerson = () => {
    setFormData(prev => ({
      ...prev,
      persons: [...prev.persons, { ...emptyPerson }]
    }));
  };

  const removePerson = (index: number) => {
    if (formData.persons.length === 1) return;
    setFormData(prev => ({
      ...prev,
      persons: prev.persons.filter((_, i) => i !== index)
    }));
  };

  const handleCancel = () => {
    // Clear saved form data when canceling
    clearSavedFormData();
    navigate('/cases');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-secondary-900 mb-8">Create New Case</h1>
      
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 rounded-md flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-8">
        {/* Case Info Section */}
        <div>
          <h2 className="text-xl font-display font-semibold text-secondary-900 mb-4 pb-2 border-b border-secondary-200">
            Case Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Case Number
              </label>
              <input
                type="text"
                value={formData.caseNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, caseNumber: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.caseNumber ? 'border-red-500' : 'border-secondary-300'
                }`}
              />
              {errors.caseNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.caseNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Case Type
              </label>
              <select
                value={formData.caseType}
                onChange={(e) => setFormData(prev => ({ ...prev, caseType: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.caseType ? 'border-red-500' : 'border-secondary-300'
                }`}
              >
                <option value="">Select Case Type</option>
                {caseTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.caseType && (
                <p className="mt-1 text-sm text-red-600">{errors.caseType}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Received Date
              </label>
              <input
                type="date"
                value={formData.receivedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, receivedDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.receivedDate ? 'border-red-500' : 'border-secondary-300'
                }`}
              />
              {errors.receivedDate && (
                <p className="mt-1 text-sm text-red-600">{errors.receivedDate}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Received Time
              </label>
              <input
                type="time"
                value={formData.receivedTime}
                onChange={(e) => setFormData(prev => ({ ...prev, receivedTime: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.receivedTime ? 'border-red-500' : 'border-secondary-300'
                }`}
              />
              {errors.receivedTime && (
                <p className="mt-1 text-sm text-red-600">{errors.receivedTime}</p>
              )}
            </div>
          </div>
        </div>

        {/* Persons Information Section */}
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-secondary-200">
            <h2 className="text-xl font-display font-semibold text-secondary-900">
              Persons Information
            </h2>
            <button
              type="button"
              onClick={addPerson}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Person
            </button>
          </div>

          <div className="space-y-6">
            {formData.persons.map((person, index) => (
              <div key={index} className="relative bg-secondary-50 rounded-lg p-4">
                <div className="absolute right-4 top-4">
                  {formData.persons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePerson(index)}
                      className="p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Person Name
                    </label>
                    <input
                      type="text"
                      value={person.name}
                      onChange={(e) => handlePersonChange(index, 'name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.persons?.[index]?.name ? 'border-red-500' : 'border-secondary-300'
                      }`}
                    />
                    {errors.persons?.[index]?.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.persons[index].name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      CPR Number
                    </label>
                    <input
                      type="text"
                      value={person.cprNo}
                      onChange={(e) => handlePersonChange(index, 'cprNo', e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Passport Number
                    </label>
                    <input
                      type="text"
                      value={person.passportNo}
                      onChange={(e) => handlePersonChange(index, 'passportNo', e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={person.gender}
                      onChange={(e) => handlePersonChange(index, 'gender', e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={person.nationality}
                      onChange={(e) => handlePersonChange(index, 'nationality', e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sender Details Section */}
        <div>
          <h2 className="text-xl font-display font-semibold text-secondary-900 mb-4 pb-2 border-b border-secondary-200">
            Sender Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Sender Name
              </label>
              <input
                type="text"
                value={formData.senderName}
                onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                From Department
              </label>
              <input
                type="text"
                value={formData.fromDept}
                onChange={(e) => setFormData(prev => ({ ...prev, fromDept: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Police Number
              </label>
              <input
                type="text"
                value={formData.policeNo}
                onChange={(e) => setFormData(prev => ({ ...prev, policeNo: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Case Number at Sender
              </label>
              <input
                type="text"
                value={formData.senderCaseNo}
                onChange={(e) => setFormData(prev => ({ ...prev, senderCaseNo: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Police Station
              </label>
              <input
                type="text"
                value={formData.policeStation}
                onChange={(e) => setFormData(prev => ({ ...prev, policeStation: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Submitted By
              </label>
              <input
                type="text"
                value={formData.submittedBy}
                onChange={(e) => setFormData(prev => ({ ...prev, submittedBy: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Submitter Police Number
              </label>
              <input
                type="text"
                value={formData.submitterPoliceNo}
                onChange={(e) => setFormData(prev => ({ ...prev, submitterPoliceNo: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Department Details Section */}
        <div>
          <h2 className="text-xl font-display font-semibold text-secondary-900 mb-4 pb-2 border-b border-secondary-200">
            Department Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Department Name
              </label>
              <select
                value={formData.departmentName}
                onChange={(e) => setFormData(prev => ({ ...prev, departmentName: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.departmentName ? 'border-red-500' : 'border-secondary-300'
                }`}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.departmentName && (
                <p className="mt-1 text-sm text-red-600">{errors.departmentName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Person in Charge
              </label>
              <input
                type="text"
                value={formData.personInCharge}
                onChange={(e) => setFormData(prev => ({ ...prev, personInCharge: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.personInCharge ? 'border-red-500' : 'border-secondary-300'
                }`}
              />
              {errors.personInCharge && (
                <p className="mt-1 text-sm text-red-600">{errors.personInCharge}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Number of Samples
              </label>
              <input
                type="number"
                min="0"
                value={formData.sampleCount}
                onChange={(e) => setFormData(prev => ({ ...prev, sampleCount: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Sample Receiver
              </label>
              <input
                type="text"
                value={formData.sampleReceiver}
                onChange={(e) => setFormData(prev => ({ ...prev, sampleReceiver: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.sampleReceiver ? 'border-red-500' : 'border-secondary-300'
                }`}
              />
              {errors.sampleReceiver && (
                <p className="mt-1 text-sm text-red-600">{errors.sampleReceiver}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Expected Finish Date
              </label>
              <input
                type="date"
                value={formData.expectedFinishDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedFinishDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.expectedFinishDate ? 'border-red-500' : 'border-secondary-300'
                }`}
              />
              {errors.expectedFinishDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expectedFinishDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h2 className="text-xl font-display font-semibold text-secondary-900 mb-4 pb-2 border-b border-secondary-200">
            Additional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Case Entered By
              </label>
              <input
                type="text"
                value={formData.caseEnteredBy}
                onChange={(e) => setFormData(prev => ({ ...prev, caseEnteredBy: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.caseEnteredBy ? 'border-red-500' : 'border-secondary-300'
                }`}
              />
              {errors.caseEnteredBy && (
                <p className="mt-1 text-sm text-red-600">{errors.caseEnteredBy}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Priority
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value="normal"
                    checked={formData.priority === 'normal'}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'normal' | 'urgent' }))}
                    className="mr-2"
                  />
                  Normal
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value="urgent"
                    checked={formData.priority === 'urgent'}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'normal' | 'urgent' }))}
                    className="mr-2"
                  />
                  <span className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    Urgent
                  </span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-md hover:bg-secondary-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors font-medium disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Case...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Case
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}