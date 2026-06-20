import logging
import json
import uuid
import numpy as np
from scipy import stats

logger = logging.getLogger(__name__)

class BiasDetectionService:
    @staticmethod
    def analyze(hackathon_id: str, fetch_all, execute):
        """
        Runs statistical bias tests on evaluation data.
        If p < 0.05 (with Bonferroni correction), logs a BIAS_ALERT to audit_logs.
        """
        logger.info(f"Running bias detection for hackathon {hackathon_id}")
        
        # 1. Fetch scores grouped by participant attributes (Institutional Bias)
        # We join evaluations -> idea_submissions -> participants to attribute a team's score to its participants
        query_inst = """
        SELECT e.score, p.college_name 
        FROM evaluations e
        JOIN idea_submissions i ON e.idea_id = i.idea_id
        JOIN participants p ON i.team_id = p.team_id
        WHERE e.score IS NOT NULL AND p.college_name IS NOT NULL AND p.college_name != ''
        """
        inst_data = fetch_all(query_inst)
        
        if len(inst_data) > 10:
            college_scores = {}
            for row in inst_data:
                col = row['college_name']
                score = row['score']
                if col not in college_scores:
                    college_scores[col] = []
                college_scores[col].append(score)
            
            # Filter colleges with at least 3 data points
            valid_colleges = {k: v for k, v in college_scores.items() if len(v) >= 3}
            
            if len(valid_colleges) >= 2:
                groups = list(valid_colleges.values())
                # Kruskal-Wallis H Test (Non-parametric ANOVA)
                stat, p_val = stats.kruskal(*groups)
                
                # Bonferroni correction (simplified for MVP: alpha = 0.05 / 2 tests = 0.025)
                if p_val < 0.025:
                    alert_payload = {
                        "type": "Institutional Bias",
                        "test": "Kruskal-Wallis",
                        "p_value": p_val,
                        "statistic": stat,
                        "details": f"Significant variance detected between {len(valid_colleges)} institutions."
                    }
                    _log_bias_alert(alert_payload, execute)

        # 2. Reviewer Harshness / Leniency Anomaly (Z-Score)
        query_rev = """
        SELECT reviewer_id, score FROM evaluations WHERE score IS NOT NULL
        """
        rev_data = fetch_all(query_rev)
        
        if len(rev_data) > 10:
            all_scores = [r['score'] for r in rev_data]
            mean_score = np.mean(all_scores)
            std_score = np.std(all_scores)
            
            if std_score > 0:
                reviewer_scores = {}
                for row in rev_data:
                    rid = str(row['reviewer_id'])
                    if rid not in reviewer_scores:
                        reviewer_scores[rid] = []
                    reviewer_scores[rid].append(row['score'])
                
                for rid, scores in reviewer_scores.items():
                    if len(scores) >= 3:
                        rev_mean = np.mean(scores)
                        z_score = (rev_mean - mean_score) / (std_score / np.sqrt(len(scores)))
                        
                        # z-score > 2.58 or < -2.58 corresponds to roughly p < 0.01
                        if abs(z_score) > 2.58:
                            alert_payload = {
                                "type": "Reviewer Anomaly",
                                "test": "Z-Score",
                                "reviewer_id": rid,
                                "z_score": z_score,
                                "details": "Reviewer is statistically harsher or more lenient than the global mean."
                            }
                            _log_bias_alert(alert_payload, execute)


def _log_bias_alert(payload: dict, execute):
    """Saves a BIAS_ALERT event into the audit_logs table."""
    logger.warning(f"BIAS ALERT GENERATED: {payload}")
    # In a real system, we'd hash the payload for tamper-evidence
    query = """
    INSERT INTO audit_logs (id, event_type, payload, prev_hash, curr_hash, created_at)
    VALUES (%s, %s, %s, %s, %s, NOW())
    """
    import hashlib
    log_id = str(uuid.uuid4())
    # numpy float is not json serializable directly
    class NpEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, np.integer):
                return int(obj)
            if isinstance(obj, np.floating):
                return float(obj)
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            return super(NpEncoder, self).default(obj)
    payload_json = json.dumps(payload, cls=NpEncoder)
    hash_val = hashlib.sha256(payload_json.encode()).hexdigest()
    
    execute(query, (log_id, "BIAS_ALERT", payload_json, "0", hash_val))
