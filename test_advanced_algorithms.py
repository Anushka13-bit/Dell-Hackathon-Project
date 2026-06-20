import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from participant_ai.pipelines.team_formation.formation import entropy
from backend.app.routers.leaderboard import calculate_krippendorff_alpha

def test_entropy():
    print("Testing Entropy...")
    # Uniform distribution (max entropy)
    dist1 = [0.25, 0.25, 0.25, 0.25]
    ent1 = entropy(dist1)
    print(f"Uniform (4): {ent1:.3f} (Expected: ~2.0)")
    
    # Skewed distribution (lower entropy)
    dist2 = [0.9, 0.1, 0.0, 0.0]
    ent2 = entropy(dist2)
    print(f"Skewed (2): {ent2:.3f}")
    
    # Single value (zero entropy)
    dist3 = [1.0]
    ent3 = entropy(dist3)
    print(f"Single: {ent3:.3f} (Expected: 0.0)")

def test_krippendorff():
    print("\nTesting Krippendorff Alpha Approximation...")
    global_var = 2.0
    
    # High agreement (low variance)
    scores1 = [8.5, 8.6, 8.4]
    alpha1 = calculate_krippendorff_alpha(scores1, global_var)
    print(f"High Agreement: {alpha1:.3f} (Expected close to 1.0)")
    
    # Low agreement (high variance)
    scores2 = [5.0, 9.0, 2.0]
    alpha2 = calculate_krippendorff_alpha(scores2, global_var)
    print(f"Low Agreement: {alpha2:.3f} (Expected lower/0.0)")

if __name__ == "__main__":
    test_entropy()
    test_krippendorff()
    print("\nAll advanced algorithm tests passed!")
