#!/usr/bin/env python3
"""
BengkelBot Pro Backend API Testing Suite
Comprehensive testing for all backend endpoints and functionality
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Optional

class BengkelBotAPITester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.auth_token = None
        self.test_user_data = {
            "email": "testmechanic@bengkelbot.com",
            "password": "SecurePass123!",
            "name": "Ahmad Mechanic",
            "workshop_name": "Bengkel Jaya Motor",
            "phone": "+62812345678"
        }
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: dict = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def test_health_check(self):
        """Test /api/health endpoint"""
        try:
            response = requests.get(f"{self.api_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    self.log_test("Health Check", True, "API is healthy", data)
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response format: {data}")
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
        return False
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        try:
            # First, try to clean up any existing test user
            try:
                login_response = requests.post(f"{self.api_url}/auth/login", 
                                             json={"email": self.test_user_data["email"], 
                                                  "password": self.test_user_data["password"]})
                if login_response.status_code == 200:
                    print("Test user already exists, proceeding with login...")
                    data = login_response.json()
                    self.auth_token = data["access_token"]
                    self.log_test("User Registration", True, "Test user already exists, using existing account", data)
                    return True
            except:
                pass
            
            # Register new user
            response = requests.post(f"{self.api_url}/auth/register", 
                                   json=self.test_user_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.log_test("User Registration", True, "User registered successfully", data)
                    return True
                else:
                    self.log_test("User Registration", False, f"Missing required fields in response: {data}")
            elif response.status_code == 400 and "already registered" in response.text:
                # User already exists, try to login
                return self.test_user_login()
            else:
                self.log_test("User Registration", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("User Registration", False, f"Registration error: {str(e)}")
        return False
    
    def test_user_login(self):
        """Test user login endpoint"""
        try:
            login_data = {
                "email": self.test_user_data["email"],
                "password": self.test_user_data["password"]
            }
            response = requests.post(f"{self.api_url}/auth/login", 
                                   json=login_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.log_test("User Login", True, "Login successful", data)
                    return True
                else:
                    self.log_test("User Login", False, f"Missing required fields in response: {data}")
            else:
                self.log_test("User Login", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("User Login", False, f"Login error: {str(e)}")
        return False
    
    def test_protected_endpoint_access(self):
        """Test JWT token validation with protected endpoints"""
        if not self.auth_token:
            self.log_test("JWT Token Validation", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(f"{self.api_url}/user/profile", 
                                  headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "email" in data and data["email"] == self.test_user_data["email"]:
                    self.log_test("JWT Token Validation", True, "Protected endpoint access successful", data)
                    return True
                else:
                    self.log_test("JWT Token Validation", False, f"Unexpected user data: {data}")
            else:
                self.log_test("JWT Token Validation", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("JWT Token Validation", False, f"Token validation error: {str(e)}")
        return False
    
    def test_symptoms_endpoint(self):
        """Test symptoms endpoint with different languages"""
        languages = ["id", "en", "es"]
        all_passed = True
        
        for lang in languages:
            try:
                response = requests.get(f"{self.api_url}/symptoms?language={lang}", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list) and len(data) > 0:
                        # Check if symptoms have required fields
                        sample_symptom = data[0]
                        if all(field in sample_symptom for field in ["id", "name", "category"]):
                            self.log_test(f"Symptoms Endpoint ({lang})", True, 
                                        f"Retrieved {len(data)} symptoms in {lang}", 
                                        {"count": len(data), "sample": sample_symptom})
                        else:
                            self.log_test(f"Symptoms Endpoint ({lang})", False, 
                                        f"Missing required fields in symptom data: {sample_symptom}")
                            all_passed = False
                    else:
                        self.log_test(f"Symptoms Endpoint ({lang})", False, 
                                    f"Empty or invalid response: {data}")
                        all_passed = False
                else:
                    self.log_test(f"Symptoms Endpoint ({lang})", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    all_passed = False
            except Exception as e:
                self.log_test(f"Symptoms Endpoint ({lang})", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_diagnosis_engine(self):
        """Test diagnosis engine with various symptom combinations"""
        if not self.auth_token:
            self.log_test("Diagnosis Engine", False, "No auth token available")
            return False
        
        test_cases = [
            {
                "name": "Single Symptom - Weak Acceleration",
                "symptoms": ["weak_acceleration"],
                "language": "id"
            },
            {
                "name": "Multiple Symptoms - Engine Issues",
                "symptoms": ["weak_acceleration", "overheating", "smoke_emission"],
                "language": "en"
            },
            {
                "name": "Brake System Issues",
                "symptoms": ["brake_issues"],
                "language": "es"
            },
            {
                "name": "Complex Diagnosis",
                "symptoms": ["cvt_noise", "hard_starting", "fuel_consumption", "poor_performance"],
                "language": "id"
            }
        ]
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        all_passed = True
        
        for test_case in test_cases:
            try:
                diagnosis_data = {
                    "symptoms": test_case["symptoms"],
                    "motorcycle_model": "Yamaha NMAX 155",
                    "year": 2023,
                    "language": test_case["language"]
                }
                
                response = requests.post(f"{self.api_url}/diagnosis", 
                                       json=diagnosis_data, 
                                       headers=headers, timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    required_fields = ["id", "diagnosis", "spare_parts", "estimated_cost", 
                                     "confidence_score", "recommendations"]
                    
                    if all(field in data for field in required_fields):
                        # Validate confidence score
                        if 0 <= data["confidence_score"] <= 1:
                            # Validate spare parts structure
                            if isinstance(data["spare_parts"], list):
                                self.log_test(f"Diagnosis Engine - {test_case['name']}", True,
                                            f"Diagnosis successful with {len(data['spare_parts'])} parts, "
                                            f"confidence: {data['confidence_score']:.2f}, "
                                            f"cost: {data['estimated_cost']}", 
                                            {"diagnosis_count": len(data["diagnosis"]),
                                             "parts_count": len(data["spare_parts"]),
                                             "confidence": data["confidence_score"]})
                            else:
                                self.log_test(f"Diagnosis Engine - {test_case['name']}", False,
                                            f"Invalid spare_parts format: {type(data['spare_parts'])}")
                                all_passed = False
                        else:
                            self.log_test(f"Diagnosis Engine - {test_case['name']}", False,
                                        f"Invalid confidence score: {data['confidence_score']}")
                            all_passed = False
                    else:
                        missing_fields = [f for f in required_fields if f not in data]
                        self.log_test(f"Diagnosis Engine - {test_case['name']}", False,
                                    f"Missing required fields: {missing_fields}")
                        all_passed = False
                else:
                    self.log_test(f"Diagnosis Engine - {test_case['name']}", False,
                                f"HTTP {response.status_code}: {response.text}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Diagnosis Engine - {test_case['name']}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_diagnosis_history(self):
        """Test diagnosis history endpoint"""
        if not self.auth_token:
            self.log_test("Diagnosis History", False, "No auth token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test basic history retrieval
            response = requests.get(f"{self.api_url}/diagnosis/history", 
                                  headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Test pagination
                    paginated_response = requests.get(f"{self.api_url}/diagnosis/history?limit=2&skip=0", 
                                                    headers=headers, timeout=10)
                    
                    if paginated_response.status_code == 200:
                        paginated_data = paginated_response.json()
                        self.log_test("Diagnosis History", True,
                                    f"Retrieved {len(data)} total diagnoses, "
                                    f"pagination works (limit 2: {len(paginated_data)} items)",
                                    {"total_count": len(data), "paginated_count": len(paginated_data)})
                        return True
                    else:
                        self.log_test("Diagnosis History", False,
                                    f"Pagination failed: HTTP {paginated_response.status_code}")
                else:
                    self.log_test("Diagnosis History", False, f"Invalid response format: {type(data)}")
            else:
                self.log_test("Diagnosis History", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Diagnosis History", False, f"Error: {str(e)}")
        return False
    
    def test_spare_parts_search(self):
        """Test spare parts search with multi-currency support"""
        test_searches = [
            {"query": "CVT", "currency": "IDR"},
            {"query": "brake", "currency": "USD"},
            {"query": "spark", "currency": "EUR"},
            {"query": "roller", "currency": "IDR"}
        ]
        
        all_passed = True
        
        for search in test_searches:
            try:
                params = {"query": search["query"], "currency": search["currency"]}
                response = requests.get(f"{self.api_url}/spare-parts/search", 
                                      params=params, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        if len(data) > 0:
                            # Validate structure of first result
                            sample_part = data[0]
                            required_fields = ["id", "name", "category", "price_range", "suppliers"]
                            
                            if all(field in sample_part for field in required_fields):
                                # Check if price_range has correct currency structure
                                price_range = sample_part["price_range"]
                                if isinstance(price_range, dict) and "average" in price_range:
                                    self.log_test(f"Spare Parts Search - {search['query']} ({search['currency']})", 
                                                True,
                                                f"Found {len(data)} parts, avg price: {price_range.get('average', 'N/A')}",
                                                {"results_count": len(data), "sample_part": sample_part["name"]})
                                else:
                                    self.log_test(f"Spare Parts Search - {search['query']} ({search['currency']})", 
                                                False, f"Invalid price_range structure: {price_range}")
                                    all_passed = False
                            else:
                                missing_fields = [f for f in required_fields if f not in sample_part]
                                self.log_test(f"Spare Parts Search - {search['query']} ({search['currency']})", 
                                            False, f"Missing fields: {missing_fields}")
                                all_passed = False
                        else:
                            self.log_test(f"Spare Parts Search - {search['query']} ({search['currency']})", 
                                        True, "No results found (valid response)", {"results_count": 0})
                    else:
                        self.log_test(f"Spare Parts Search - {search['query']} ({search['currency']})", 
                                    False, f"Invalid response format: {type(data)}")
                        all_passed = False
                else:
                    self.log_test(f"Spare Parts Search - {search['query']} ({search['currency']})", 
                                False, f"HTTP {response.status_code}: {response.text}")
                    all_passed = False
            except Exception as e:
                self.log_test(f"Spare Parts Search - {search['query']} ({search['currency']})", 
                            False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_profile_management(self):
        """Test profile update functionality"""
        if not self.auth_token:
            self.log_test("Profile Management", False, "No auth token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test profile update
            update_data = {
                "name": "Ahmad Updated Mechanic",
                "workshop_name": "Bengkel Jaya Motor Updated",
                "phone": "+62812345679"
            }
            
            response = requests.put(f"{self.api_url}/user/profile", 
                                  json=update_data, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("name") == update_data["name"] and 
                    data.get("workshop_name") == update_data["workshop_name"] and
                    data.get("phone") == update_data["phone"]):
                    self.log_test("Profile Management", True, "Profile updated successfully", data)
                    return True
                else:
                    self.log_test("Profile Management", False, f"Profile not updated correctly: {data}")
            else:
                self.log_test("Profile Management", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Profile Management", False, f"Error: {str(e)}")
        return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting BengkelBot Pro Backend API Tests")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("JWT Token Validation", self.test_protected_endpoint_access),
            ("Symptoms Management", self.test_symptoms_endpoint),
            ("Diagnosis Engine", self.test_diagnosis_engine),
            ("Diagnosis History", self.test_diagnosis_history),
            ("Spare Parts Search", self.test_spare_parts_search),
            ("Profile Management", self.test_profile_management)
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🔍 Running {test_name}...")
            if test_func():
                passed_tests += 1
            time.sleep(1)  # Brief pause between tests
        
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            print("🎉 ALL TESTS PASSED! Backend API is working correctly.")
        else:
            print(f"⚠️  {total_tests - passed_tests} tests failed. Check details above.")
        
        return passed_tests, total_tests, self.test_results

def main():
    """Main test execution"""
    # Use the frontend environment variable for backend URL
    import os
    backend_url = "http://localhost:8001"  # Default from frontend/.env
    
    tester = BengkelBotAPITester(backend_url)
    passed, total, results = tester.run_all_tests()
    
    # Save detailed results
    with open("/app/backend_test_results.json", "w") as f:
        json.dump({
            "summary": {"passed": passed, "total": total, "success_rate": passed/total},
            "timestamp": datetime.now().isoformat(),
            "detailed_results": results
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)