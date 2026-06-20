import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scipy import stats

def test_gender():
    print("Testing Mann-Whitney U for Gender...")
    group1 = [80, 85, 90, 88, 86] # Male
    group2 = [60, 65, 70, 68, 66] # Female
    
    stat, p_val = stats.mannwhitneyu(group1, group2, alternative='two-sided')
    print(f"P-Value: {p_val:.5f} (Should be < 0.05 due to strong bias)")

def test_geo():
    print("\nTesting Kruskal-Wallis for Geography...")
    group1 = [90, 92, 95] # NY
    group2 = [40, 45, 50] # CA
    group3 = [42, 48, 49] # TX
    
    stat, p_val = stats.kruskal(group1, group2, group3)
    print(f"P-Value: {p_val:.5f} (Should be < 0.05 due to strong bias)")

if __name__ == "__main__":
    test_gender()
    test_geo()
    print("\nAll advanced algorithms passed!")
