"use client";
import { useState } from "react";

export default function HackathonReviewers() {
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAutoAssign = async () => {
    setIsAssigning(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments/generate`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Successfully assigned ${data.count} reviewers!`);
      } else {
        alert("Failed to assign reviewers");
      }
    } catch (error) {
      console.error(error);
      alert("Error calling assignment optimizer");
    } finally {
      setIsAssigning(false);
    }
  };
  return (
    <div className="px-8 py-10 max-w-[1280px] mx-auto min-h-screen">
      {/* Metrics Section */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-1 transition-transform">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Total Reviewers</p>
          <div className="flex items-end justify-between">
            <h3 className="font-headline-md text-[32px] font-bold leading-none">42</h3>
            <span className="text-primary font-bold text-[12px]">+4</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-1 transition-transform">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Active</p>
          <div className="flex items-end justify-between">
            <h3 className="font-headline-md text-[32px] font-bold leading-none">38</h3>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mb-2"></div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-1 transition-transform">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Assigned</p>
          <div className="flex items-end justify-between">
            <h3 className="font-headline-md text-[32px] font-bold leading-none">156</h3>
            <span className="material-symbols-outlined text-outline">assignment</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-1 transition-transform">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Pending</p>
          <div className="flex items-end justify-between">
            <h3 className="font-headline-md text-[32px] font-bold leading-none">44</h3>
            <div className="px-1.5 py-0.5 bg-secondary-container text-on-secondary-container rounded text-[10px] mb-1 font-bold">URGENT</div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-1 transition-transform border-error/20">
          <p className="text-error text-[12px] font-bold uppercase mb-2">Risk Alerts</p>
          <div className="flex items-end justify-between">
            <h3 className="font-headline-md text-[32px] font-bold leading-none text-error">3</h3>
            <span className="material-symbols-outlined text-error">warning</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-1 transition-transform">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Avg Time</p>
          <div className="flex items-end justify-between">
            <h3 className="font-headline-md text-[32px] font-bold leading-none">1.2<span className="text-[12px] ml-1 opacity-50">d</span></h3>
            <span className="material-symbols-outlined text-outline">speed</span>
          </div>
        </div>
      </section>


      {/* Main Workspace: Table & Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Table Section */}
        <div className="w-full">
          <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-headline-sm text-[20px] font-bold">Reviewer Management</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleAutoAssign}
                  disabled={isAssigning}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-[14px] font-medium flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isAssigning ? "hourglass_top" : "auto_awesome"}
                  </span> 
                  {isAssigning ? "Assigning..." : "Auto-Assign Reviewers"}
                </button>
                <button className="px-4 py-2 border border-outline-variant/50 rounded-lg text-[14px] font-medium flex items-center gap-2 hover:bg-surface-container-low transition-all">
                  <span className="material-symbols-outlined text-[20px]">filter_list</span> Filter
                </button>
                <button className="px-4 py-2 border border-outline-variant/50 rounded-lg text-[14px] font-medium flex items-center gap-2 hover:bg-surface-container-low transition-all">
                  <span className="material-symbols-outlined text-[20px]">download</span> Export CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-surface-container-low/50 text-outline uppercase text-[11px] font-bold tracking-widest border-b border-outline-variant/20">
                  <tr>
                    <th className="px-8 py-4">Reviewer</th>
                    <th className="px-4 py-4">Expertise</th>
                    <th className="px-4 py-4 text-center">Assigned Teams</th>
                    <th className="px-4 py-4 text-center">Done</th>
                    <th className="px-4 py-4 text-center">Avg. Score</th>
                    <th className="px-4 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {/* Row 1 */}
                  <tr className="hover:bg-surface-container-lowest/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <img className="w-9 h-9 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3gyrm8jTJhjIMlSdJ2Xe1Trv4UIuJI2fMbQAF17oXkY4rJ6Di5_Q6w8tj9L3WIIZ9XCayXzGtRbtwa5v7TzIvvxU7TdeaMSgE7i9t3fj1UAcLaUoreLmI2QjiaOC-oERZwfZgxPSvl6x7j19LBB5_tFqUaYeMVNWhXQsRbbwn3PAOw0D8SjrW08CP8_xmAbiV70ShgfL1FIm08oajaE8HWGAEfxUq2Q4GgvCFND89I2rGYucgZeQMsS2tddTBbiYGXKXIZYmQi34" alt="Reviewer" />
                        <div>
                          <p className="font-bold text-[14px]">Elena Rodriguez</p>
                          <p className="text-[11px] text-outline font-medium">Summit University</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded text-[10px] font-bold">Product Design</span>
                    </td>
                    <td className="px-4 py-5 text-center font-bold">10</td>
                    <td className="px-4 py-5 text-center text-primary font-bold">8</td>
                    <td className="px-4 py-5 text-center font-bold">8.4</td>
                    
                    <td className="px-8 py-5 text-center ">
                      <button className="text-primary hover:text-primary/70 font-bold text-[12px] flex items-center gap-1 inline-flex"><span className="material-symbols-outlined text-[16px]">visibility</span>Teams</button>
                      <button className="text-primary hover:text-primary/70 font-bold text-[12px]">Assign</button>
                      <button className="text-outline hover:text-on-surface font-bold text-[12px]">View</button>
                    </td>
                  </tr>
                  <tr className="bg-surface-container-low/30">
                    <td className="px-8 py-4" colSpan={6}>
                      <div className="grid grid-cols-3 gap-4 text-[12px]">
                        <div className="space-y-2">
                          <p className="font-bold text-outline uppercase text-[10px]">Team Name</p>
                          <p className="font-bold">EcoPulse</p>
                          <p className="font-bold">GreenGrid</p>
                        </div>
                        <div className="space-y-2">
                          <p className="font-bold text-outline uppercase text-[10px]">Problem Statement</p>
                          <p className="truncate font-medium">Urban Carbon Sequestration</p>
                          <p className="truncate font-medium">Renewable Energy Distribution</p>
                        </div>
                        <div className="space-y-2">
                          <p className="font-bold text-outline uppercase text-[10px]">Status</p>
                          <p className="text-green-600 font-bold">Evaluated</p>
                          <p className="text-amber-600 font-bold">Pending</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                  {/* Row 2 */}
                  <tr className="hover:bg-surface-container-lowest/50 transition-colors group border-t border-outline-variant/10">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <img className="w-9 h-9 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4U9ueqgoA3JRKRsJOxj_0AqGvgQE3pi9yNf2B1TZbWLV3NGbv-wFl2VYqKQKQnfmtXqVP3dEm4CC0Ra8jBNNj9yW9Hvo_NLNWIsPFt6DBM3d8ZXe5PFMRZgJXqb2QTbSnYT1FUdazrpqrKhZlYbU0hoe0X9n0ueUH9kYGLpE2ORGaq5lD5tVvSA3pXxX6Q_5BbyA2KHvCSK5tttZ_qJo8p6AV4M0jreH98j5ADZ-EzahY5Sxz6EuztIR5U8ENZeihHmkz-B2t0vI" alt="Reviewer" />
                        <div>
                          <p className="font-bold text-[14px]">Jonas Miller</p>
                          <p className="text-[11px] text-outline font-medium">GreenTech Labs</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded text-[10px] font-bold">Fullstack Dev</span>
                    </td>
                    <td className="px-4 py-5 text-center font-bold">15</td>
                    <td className="px-4 py-5 text-center text-primary font-bold">14</td>
                    <td className="px-4 py-5 text-center font-bold">7.2</td>
                    
                    <td className="px-8 py-5 text-right space-x-2">
                      <button className="text-primary hover:text-primary/70 font-bold text-[12px] flex items-center gap-1 inline-flex"><span className="material-symbols-outlined text-[16px]">visibility</span>Teams</button>
                      <button className="text-primary hover:text-primary/70 font-bold text-[12px]">Assign</button>
                      <button className="text-outline hover:text-on-surface font-bold text-[12px]">View</button>
                    </td>
                  </tr>
                  {/* Row 3 */}
                  <tr className="hover:bg-surface-container-lowest/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <img className="w-9 h-9 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjyUpyp_y0LdAMZlh2WphbF2uELx7WRCAKTy8zHTWGEwb6Wv3PV-HI1Tu4muZfreiXj0Kl0aQya2j5ltPt9foN5guMQxU4D5Da2_qTbJHka4hG01bBmLuPKigJ1UGJTSpAgoXF7PxBEg3pCQUAOg4YMkf3HKwS8iRsSW0cYJuxTY0UAjyhKz7DG9ur6JqaO6nZUYsvtSgGxFwm3oxt5m6XQTTGMKYykV6SIgnQtRy3TD547TI1dOGNlTu9VrarJT-RcFo1FvDVi2Y" alt="Reviewer" />
                        <div>
                          <p className="font-bold text-[14px]">Amara Okafor</p>
                          <p className="text-[11px] text-outline font-medium">Global Health Inst.</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded text-[10px] font-bold">HealthTech</span>
                    </td>
                    <td className="px-4 py-5 text-center font-bold">22</td>
                    <td className="px-4 py-5 text-center text-primary font-bold">12</td>
                    <td className="px-4 py-5 text-center font-bold">9.5</td>
                    
                    <td className="px-8 py-5 text-right space-x-2">
                      <button className="text-primary hover:text-primary/70 font-bold text-[12px] flex items-center gap-1 inline-flex"><span className="material-symbols-outlined text-[16px]">visibility</span>Teams</button>
                      <button className="text-primary hover:text-primary/70 font-bold text-[12px]">Assign</button>
                      <button className="text-outline hover:text-on-surface font-bold text-[12px]">View</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-8 py-4 bg-surface-container-low/30 border-t border-outline-variant/20 flex items-center justify-between">
              <p className="text-[12px] text-on-surface-variant font-medium">Showing 3 of 42 reviewers</p>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded border border-outline-variant/30 hover:bg-white text-outline transition-all disabled:opacity-30 flex items-center justify-center" disabled>
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <span className="text-[12px] font-bold px-2">Page 1 of 14</span>
                <button className="p-1.5 rounded border border-outline-variant/30 hover:bg-white text-on-surface transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Insights Panel */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          {/* Risk Analysis */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/20">
            <h4 className="font-headline-sm text-[18px] font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">analytics</span> Risk Analysis
            </h4>
            <div className="mb-8">
              <p className="text-[12px] font-bold text-on-surface-variant mb-4 uppercase tracking-tighter">Score Distribution</p>
              <div className="flex items-end gap-1 h-24 mb-2 px-2">
                <div className="flex-1 bg-primary/10 rounded-t-sm h-[30%]"></div>
                <div className="flex-1 bg-primary/20 rounded-t-sm h-[45%]"></div>
                <div className="flex-1 bg-primary/40 rounded-t-sm h-[80%]"></div>
                <div className="flex-1 bg-primary/100 rounded-t-sm h-[100%]"></div>
                <div className="flex-1 bg-primary/60 rounded-t-sm h-[65%]"></div>
                <div className="flex-1 bg-primary/30 rounded-t-sm h-[40%]"></div>
              </div>
              <div className="flex justify-between text-[10px] text-outline font-bold">
                <span>POOR</span>
                <span>AVERAGE</span>
                <span>ELITE</span>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-tighter">Bias Indicators</p>
              <div className="flex items-center justify-between p-3 bg-error-container/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[18px]">trending_up</span>
                  <span className="text-[12px] font-bold">Lenient Grading</span>
                </div>
                <span className="text-[12px] font-bold text-error">8% inc.</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">diversity_1</span>
                  <span className="text-[12px] font-bold">Domain Favoritism</span>
                </div>
                <span className="text-[12px] font-bold text-primary">Stable</span>
              </div>
            </div>
          </div>
          {/* Strategic Insights */}
          
        </aside>
      </div>
    </div>
  );
}
