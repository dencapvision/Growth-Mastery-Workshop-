
import React, { useState, useEffect } from 'react';
import { WheelOfLife } from './components/WheelOfLife';
import { GrowthRoadmap } from './components/GrowthRoadmap';
import { SlideDeck } from './components/SlideDeck';
import { WorksheetType, WheelData, GrowthRoadmapState } from './types';
import { GoogleGenAI, Type } from "@google/genai";

const STORAGE_KEYS = {
  WHEEL_DATA: 'growth_mastery_wheel_data',
  WHEEL_REFLECTIONS: 'growth_mastery_wheel_reflections',
  IDP_DATA: 'growth_mastery_idp_data',
  ACTIVE_TAB: 'growth_mastery_active_tab'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WorksheetType>('SLIDES');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rowGenerating, setRowGenerating] = useState<number | null>(null);
  const [showPrintTip, setShowPrintTip] = useState(false);

  // Wheel State
  const [wheelData, setWheelData] = useState<WheelData>({
    career: 0, finances: 0, health: 0, family: 0,
    relationships: 0, growth: 0, fun: 0, contribution: 0
  });
  const [wheelReflections, setWheelReflections] = useState({
    shape: '', missing: '', commitment: ''
  });

  // IDP State
  const [idpData, setIdpData] = useState<GrowthRoadmapState>({
    name: '',
    team: '',
    strengths: [],
    gaps: [],
    mainGoal: '',
    feeling: '',
    plans: [
      { goal: 'ด้าน Mindset', steps: [], timeline: '', support: '' },
      { goal: 'ด้าน Skillset', steps: [], timeline: '', support: '' },
      { goal: 'ด้านอื่นๆ', steps: [], timeline: '', support: '' }
    ]
  });

  // Persistence logic
  useEffect(() => {
    try {
      const savedWheelData = localStorage.getItem(STORAGE_KEYS.WHEEL_DATA);
      const savedWheelReflections = localStorage.getItem(STORAGE_KEYS.WHEEL_REFLECTIONS);
      const savedIdpData = localStorage.getItem(STORAGE_KEYS.IDP_DATA);
      const savedTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);

      if (savedWheelData) setWheelData(JSON.parse(savedWheelData));
      if (savedWheelReflections) setWheelReflections(JSON.parse(savedWheelReflections));
      if (savedIdpData) setIdpData(JSON.parse(savedIdpData));
      if (savedTab) setActiveTab(savedTab as WorksheetType);
    } catch (e) { console.error("Restore error", e); }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WHEEL_DATA, JSON.stringify(wheelData));
    localStorage.setItem(STORAGE_KEYS.WHEEL_REFLECTIONS, JSON.stringify(wheelReflections));
    localStorage.setItem(STORAGE_KEYS.IDP_DATA, JSON.stringify(idpData));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [wheelData, wheelReflections, idpData, activeTab]);

  const loadExampleData = () => {
    if (activeTab === 'WHEEL') {
      setWheelData({ career: 8, finances: 6, health: 7, family: 9, relationships: 8, growth: 7, fun: 4, contribution: 6 });
      setWheelReflections({
        shape: 'วงล้อดูค่อนข้างเบี้ยวในด้านการพักผ่อน ทำให้ชีวิตตึงเกินไป',
        missing: 'ด้านการพักผ่อน (Fun) หายไปมากที่สุด เพราะมัวแต่โฟกัสงาน',
        commitment: 'จะจัดเวลาไปคาเฟ่หรืออ่านนิยายที่ชอบสัปดาห์ละ 2 ชั่วโมง'
      });
    } else if (activeTab === 'IDP') {
      setIdpData({
        name: 'สมชาย นักสู้', team: 'Innovation Team',
        strengths: ['Critical Thinking', 'Problem Solving'],
        gaps: ['Public Speaking', 'Delegation'],
        mainGoal: 'ขึ้นเป็น Team Lead ภายในไตรมาสที่ 4',
        feeling: 'รู้สึกมั่นใจและพร้อมพาทีมก้าวไปข้างหน้า',
        plans: [
          { goal: 'ด้าน Mindset: Emotional Intelligence', steps: ['ฝึกสมาธิ 10 นาทีก่อนประชุม', 'จดบันทึกการเรียนรู้รายวัน'], timeline: 'ทุกวันจันทร์-ศุกร์', support: 'Mentoring จากพี่หัวหน้า' },
          { goal: 'ด้าน Skillset: Presentation Skills', steps: ['เรียนคอร์ส Storytelling', 'อาสานำเสนอใน Weekly Meeting'], timeline: 'ทุกวันอังคาร', support: 'คอร์สเรียนออนไลน์' },
          { goal: 'ด้านอื่นๆ: Networking', steps: ['นัดคุยกับ Manager แผนกอื่นเดือนละครั้ง'], timeline: 'เดือนละ 1 ครั้ง', support: 'HR Team' }
        ]
      });
    }
  };

  const clearData = () => {
    if (confirm('คุณต้องการล้างข้อมูลทั้งหมดในหน้านี้ใช่หรือไม่?')) {
      if (activeTab === 'WHEEL') {
        setWheelData({ career: 0, finances: 0, health: 0, family: 0, relationships: 0, growth: 0, fun: 0, contribution: 0 });
        setWheelReflections({ shape: '', missing: '', commitment: '' });
      } else if (activeTab === 'IDP') {
        setIdpData({
          name: '', team: '', strengths: [], gaps: [], mainGoal: '', feeling: '',
          plans: [{ goal: 'ด้าน Mindset', steps: [], timeline: '', support: '' }, { goal: 'ด้าน Skillset', steps: [], timeline: '', support: '' }, { goal: 'ด้านอื่นๆ', steps: [], timeline: '', support: '' }]
        });
      }
    }
  };

  const generateWithAI = async () => {
    if (!idpData.mainGoal) return alert("กรุณาระบุเป้าหมายหลักก่อนครับ");
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `ช่วยวางแผน IDP สำหรับเป้าหมาย: "${idpData.mainGoal}" โดยมีจุดแข็งคือ ${idpData.strengths.join(', ')} และจุดที่ต้องพัฒนาคือ ${idpData.gaps.join(', ')} กรุณาแนะนำขั้นตอนที่เฉพาะเจาะจงและทำได้จริงเป็นภาษาไทย`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              plans: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    goal: { type: Type.STRING },
                    steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                    timeline: { type: Type.STRING },
                    support: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });
      const result = JSON.parse(response.text || '{}');
      if (result.plans) setIdpData(prev => ({ ...prev, plans: result.plans }));
    } catch (e) { console.error(e); alert("AI ขัดข้องชั่วคราว กรุณาลองใหม่ครับ"); }
    finally { setIsGenerating(false); }
  };

  const generateRowSteps = async (index: number) => {
    const plan = idpData.plans[index];
    if (!plan.goal) return alert("ระบุเป้าหมายย่อยก่อนครับ");
    setRowGenerating(index);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `แนะนำ Action Steps 3-4 ข้อสำหรับเป้าหมาย: "${plan.goal}" ภายใต้เป้าหมายหลักคือ "${idpData.mainGoal}" ภาษาไทย`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              timeline: { type: Type.STRING },
              support: { type: Type.STRING }
            }
          }
        }
      });
      const result = JSON.parse(response.text || '{}');
      const newPlans = [...idpData.plans];
      newPlans[index] = { ...newPlans[index], steps: result.steps || [], timeline: result.timeline || '', support: result.support || '' };
      setIdpData(prev => ({ ...prev, plans: newPlans }));
    } catch (e) { console.error(e); }
    finally { setRowGenerating(null); }
  };

  const handlePrint = () => {
    setShowPrintTip(true);
    setTimeout(() => {
      window.print();
      setShowPrintTip(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 bg-gray-100">
      {/* Top Banner & Navigation */}
      <div className="no-print w-full max-w-6xl mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Growth Mastery Handouts</h1>
          <p className="text-sm text-gray-500 italic">"Design Your Life, Ignite Your Power"</p>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0 justify-center items-center">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['SLIDES', 'WHEEL', 'IDP'] as WorksheetType[]).map(t => (
              <button 
                key={t} 
                onClick={() => setActiveTab(t)} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === t ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                {t === 'SLIDES' ? '📺 Slides' : t === 'WHEEL' ? '🎡 Wheel' : '🗺️ IDP'}
              </button>
            ))}
          </div>
          
          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          <button onClick={loadExampleData} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 border border-blue-200 transition-colors">✨ Demo</button>
          <button onClick={clearData} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 border border-red-100 transition-colors">🗑️ Clear</button>
          
          <div className="relative">
            <button 
              onClick={handlePrint} 
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export as PDF
            </button>
            
            {showPrintTip && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-emerald-900 text-white p-3 rounded-xl text-[10px] shadow-2xl z-50 animate-bounce">
                <p className="font-bold mb-1">💡 Pro Tip for PDF:</p>
                <p>เลือกปลายทางเป็น <b>"Save as PDF"</b> และอย่าลืมติ๊ก <b>"Background Graphics"</b> ในส่วนการตั้งค่าเพิ่มเติมนะครับ!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="w-full flex justify-center pb-20">
        <div className="w-full">
          {activeTab === 'SLIDES' ? (
            <SlideDeck />
          ) : activeTab === 'WHEEL' ? (
            <WheelOfLife 
              data={wheelData} 
              onChange={d => setWheelData(p => ({ ...p, ...d }))} 
              reflections={wheelReflections} 
              onReflectionChange={(k, v) => setWheelReflections(p => ({ ...p, [k]: v }))} 
            />
          ) : (
            <GrowthRoadmap 
              data={idpData} 
              onChange={d => setIdpData(p => ({ ...p, ...d }))} 
              onGenerateAI={generateWithAI} 
              onGenerateRowAI={generateRowSteps} 
              isGenerating={isGenerating} 
              rowGenerating={rowGenerating} 
            />
          )}
        </div>
      </main>
      
      <footer className="no-print mt-auto text-gray-400 text-[10px] text-center py-6 font-bold uppercase tracking-widest">
        Growth Mastery Materials | DFA - Art of Growth | Line OA: @denmasterfa
      </footer>
      
      <style>{`
        @media print {
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .no-print { display: none !important; }
          .printable-area { 
            box-shadow: none !important; 
            margin: 0 auto !important; 
            border: none !important; 
            page-break-after: always; 
            display: flex !important; 
            width: 210mm !important; 
            height: 297mm !important;
          }
          .printable-slide { 
            box-shadow: none !important; 
            margin: 0 !important; 
            width: 297mm !important; 
            height: 210mm !important; 
            page-break-after: always; 
            border: none !important; 
          }
        }
      `}</style>
    </div>
  );
};

export default App;