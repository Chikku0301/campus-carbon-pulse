# -------------------------------------------------------------------
# Backend Verification Tests for Campus Carbon Pulse
#
# This script performs automated testing of the FastAPI backend using
# FastAPI's TestClient. It verifies:
#   - Emissions API
#   - Historical data API
#   - Insights API
#   - GeoJSON updates
#   - Error handling for invalid requests
# -------------------------------------------------------------------

import sys
import os
import json
from fastapi.testclient import TestClient

# -------------------------------------------------------------------
# Add the current directory to Python's module search path so that
# main.py can be imported successfully regardless of where the script
# is executed from.
# -------------------------------------------------------------------
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the FastAPI application instance and required file paths
from main import app, GEOJSON_FILE, EMISSIONS_FILE

# Create a test client for sending HTTP requests without starting
# an actual server.
client = TestClient(app)


# -------------------------------------------------------------------
# Test the emissions prediction endpoint
# -------------------------------------------------------------------
def test_get_emissions():
    print("Testing GET /get-emissions/{hour} ...")

    # Verify that the emissions JSON file exists.
    # The API depends on this file for returning predictions.
    assert os.path.exists(
        EMISSIONS_FILE
    ), f"{EMISSIONS_FILE} does not exist!"

    # ---------------------------------------------------------------
    # Test a valid request
    # ---------------------------------------------------------------
    response = client.get("/get-emissions/10")

    # Verify successful response
    assert response.status_code == 200, (
        f"Expected 200, got {response.status_code}. "
        f"Response: {response.text}"
    )

    data = response.json()

    # Verify response structure
    assert "hour" in data, "Response missing 'hour'"
    assert data["hour"] == 10, (
        f"Expected hour 10, got {data['hour']}"
    )

    assert "results" in data, "Response missing 'results'"
    assert len(data["results"]) > 0, "Results list is empty"

    # Retrieve first building prediction
    first_result = data["results"][0]

    # Verify required fields exist
    assert "building_id" in first_result, (
        "Result missing 'building_id'"
    )
    assert "total_emission" in first_result, (
        "Result missing 'total_emission'"
    )
    assert "scaled_emission" in first_result, (
        "Result missing 'scaled_emission'"
    )

    print("✅ GET /get-emissions/10 passed!")

    # ---------------------------------------------------------------
    # Verify that the GeoJSON file was updated
    # ---------------------------------------------------------------
    print("Verifying GeoJSON file update ...")

    assert os.path.exists(
        GEOJSON_FILE
    ), f"GeoJSON file {GEOJSON_FILE} not found!"

    with open(GEOJSON_FILE, "r") as f:
        geojson = json.load(f)

    # Verify GeoJSON structure
    assert "features" in geojson, "GeoJSON missing 'features'"
    assert len(geojson["features"]) > 0, (
        "GeoJSON features list is empty"
    )

    # ---------------------------------------------------------------
    # Verify building properties
    # ---------------------------------------------------------------
    for feature in geojson["features"]:
        props = feature["properties"]

        assert "name" in props, (
            "Feature properties missing 'name'"
        )

        assert "height" in props, (
            "Feature properties missing 'height'"
        )

        # Verify that the selected building contains updated values
        if props["name"] == first_result["building_id"]:
            assert "carbon" in props, (
                "Feature properties missing 'carbon'"
            )

            assert "heatLevel" in props, (
                "Feature properties missing 'heatLevel'"
            )

    print("✅ GeoJSON verification passed!")


# -------------------------------------------------------------------
# Test invalid input for emissions endpoint
# -------------------------------------------------------------------
def test_invalid_emissions_hour():
    print("Testing invalid hours for GET /get-emissions/{hour} ...")

    # Test an hour greater than the valid range
    response = client.get("/get-emissions/25")

    assert response.status_code == 400, (
        f"Expected 400, got {response.status_code}"
    )

    # Test a negative hour
    response = client.get("/get-emissions/-1")

    assert response.status_code == 400, (
        f"Expected 400, got {response.status_code}"
    )

    print("✅ Invalid hours check passed!")


# -------------------------------------------------------------------
# Test historical data endpoint
# -------------------------------------------------------------------
def test_get_historical_data():
    print("Testing GET /get-historical-data/{days} ...")

    # Request historical data for seven days
    response = client.get("/get-historical-data/7")

    # Verify successful response
    assert response.status_code == 200, (
        f"Expected 200, got {response.status_code}"
    )

    data = response.json()

    # Verify response structure
    assert "days" in data, "Response missing 'days'"

    assert data["days"] == 7, (
        f"Expected days 7, got {data['days']}"
    )

    assert "data" in data, "Response missing 'data'"

    assert len(data["data"]) == 7, (
        f"Expected 7 days of data, got {len(data['data'])}"
    )

    # Verify one day's information
    day_data = data["data"][0]

    assert "date" in day_data, "Day data missing 'date'"
    assert "carbon" in day_data, "Day data missing 'carbon'"
    assert "buildings" in day_data, "Day data missing 'buildings'"

    print("✅ GET /get-historical-data/7 passed!")


# -------------------------------------------------------------------
# Test AI Insights endpoint
# -------------------------------------------------------------------
def test_get_insights():
    print("Testing GET /get-insights ...")

    response = client.get("/get-insights")

    # ---------------------------------------------------------------
    # If the Gemini API key is not configured, the endpoint should
    # return an informative error.
    # ---------------------------------------------------------------
    if not os.getenv("GEMINI_API_KEY"):

        assert response.status_code == 500, (
            f"Expected 500 due to missing API key, "
            f"got {response.status_code}. "
            f"Response: {response.text}"
        )

        assert "GEMINI_API_KEY" in response.json()["detail"], (
            "Expected detail message to mention GEMINI_API_KEY"
        )

        print(
            "✅ GET /get-insights handled missing API key "
            "correctly (returned 500)!"
        )

    # ---------------------------------------------------------------
    # Otherwise, verify successful AI insight generation
    # ---------------------------------------------------------------
    else:

        assert response.status_code == 200, (
            f"Expected 200, got {response.status_code}. "
            f"Response: {response.text}"
        )

        data = response.json()

        assert data["success"] is True, (
            "Expected success to be True"
        )

        assert "insights" in data, (
            "Expected insights field"
        )

        assert "summary" in data["insights"], (
            "Expected summary in insights"
        )

        print("✅ GET /get-insights passed (API key was present)!")


# -------------------------------------------------------------------
# Main Entry Point
# Runs every backend verification test sequentially.
# -------------------------------------------------------------------
if __name__ == "__main__":

    print("=" * 50)
    print("Running Campus Carbon Pulse Backend Verification Tests")
    print("=" * 50)

    try:
        # Execute all test cases
        test_get_emissions()
        test_invalid_emissions_hour()
        test_get_historical_data()
        test_get_insights()

        print("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉")

    # Handle assertion failures
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        sys.exit(1)

    # Handle unexpected exceptions
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        sys.exit(1)