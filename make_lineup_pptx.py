# -*- coding: utf-8 -*-
"""
내수동 경주자 2026 · 4학기 전체 라인업 PPT (16:9)
- 타이틀 1장 + 반별 10장(1반~6반, 고3-1~4) = 11장
- 반 1장당: 대가족 · 반 · 담당교사 + 학생 이름(학년) 명단
출력: lineup.pptx
"""
import os, sys
from datetime import date
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
sys.stdout.reconfigure(encoding='utf-8')

# ===== 데이터 (2026 4학기 · 10반 체계, dashboard.html 동일) =====
CELL_ORDER = ['1반','2반','3반','4반','5반','6반','고3-1','고3-2','고3-3','고3-4']

CELL_TEACHERS = {
    '1반':   {'homeroom':'이유성', 'sub':'고은솔'},
    '2반':   {'homeroom':'이윤정', 'sub':'박해니'},
    '3반':   {'homeroom':'정유빈', 'sub':'송진우'},
    '4반':   {'homeroom':'박대철', 'sub':'김희원'},
    '5반':   {'homeroom':'김광현', 'sub':'김주영'},
    '6반':   {'homeroom':'석준원', 'sub':'오은규'},
    '고3-1': {'homeroom':'이규리', 'sub':''},
    '고3-2': {'homeroom':'전성희', 'sub':''},
    '고3-3': {'homeroom':'최희승', 'sub':''},
    '고3-4': {'homeroom':'양지현', 'sub':''},
}

CELL_STUDENTS = {
    '1반': [('오은수',1,'여'),('김나현',2,'여'),('김채은',2,'여'),('박지웅',1,'남'),
            ('이가영',2,'여'),('민예원',2,'여'),('이서현',1,'여'),('이소현',1,'여'),('김라일',2,'남')],
    '2반': [('김정록',1,'남'),('안민혁',1,'남'),('박민주',1,'여'),('전지훈',2,'남'),
            ('이주형',1,'여'),('박동하',1,'남'),('김강은',1,'여'),('원대연',2,'남'),('유재희',2,'여')],
    '3반': [('김한결',1,'남'),('최지은',1,'여'),('최민호',2,'남'),('김강희',1,'여'),
            ('배유나',2,'여'),('박재영',1,'남'),('조한나',1,'여'),('하은유',1,'여'),('장지현',2,'여')],
    '4반': [('고예나',1,'여'),('이빛가온',1,'남'),('최수지',1,'여'),('윤서희',2,'여'),
            ('김재원',1,'남'),('하어림',1,'남'),('오현우',1,'남'),('연해준',2,'남'),('송준원',1,'남')],
    '5반': [('윤성하',1,'남'),('김은',1,'여'),('김유진',2,'여'),('임태민',2,'남'),
            ('강은교',2,'여'),('유나린',2,'여'),('권하율',1,'남'),('김주하',2,'여'),('정태율',1,'남')],
    '6반': [('나호윤',1,'남'),('이서후',1,'여'),('최유현',1,'여'),('김도연',2,'여'),
            ('양소희',2,'여'),('홍기진',2,'남'),('이준호',2,'남'),('박시우',1,'남'),('이하준',1,'남')],
    '고3-1': [('송성모',3,'남'),('김도헌',3,'남'),('이소민',3,'여'),('박지호',3,'여'),
              ('한채은',3,'여'),('김준수',3,'남'),('박진서',3,'여'),('임소명',3,'여')],
    '고3-2': [('이에녹',3,'남'),('백결',3,'남'),('조혁준',3,'남'),('최승아',3,'여'),
              ('조강인',3,'남'),('정승빈',3,'여'),('서이수',3,'여'),('김민채',3,'여')],
    '고3-3': [('곽지원',3,'남'),('김다은',3,'여'),('장세민',3,'남'),('정원영',3,'남'),
              ('주성',3,'남'),('나정인',3,'여'),('명주원',3,'남')],
    '고3-4': [('최가은',3,'여'),('김은우',3,'여'),('최지윤',3,'여'),('최서윤',3,'여'),
              ('오희수',3,'여'),('심희은',3,'여'),('조인상',3,'여'),('양인혁',3,'남')],
}

CELL_FAMILY = {'1반':1,'2반':1,'3반':2,'4반':2,'5반':3,'6반':3,
               '고3-1':4,'고3-2':4,'고3-3':4,'고3-4':4}
FAMILY_LEADERS = {1:'이윤정 (2반)', 2:'박대철 (4반)', 3:'석준원 (6반)', 4:'전성희 (고3-2)'}

# ===== 색상 =====
DARK   = RGBColor(0x17,0x13,0x2B)
PURPLE = RGBColor(0x7C,0x3A,0xED)
LILAC  = RGBColor(0xA7,0x8B,0xFA)
GREEN  = RGBColor(0x16,0xA3,0x74)
INK    = RGBColor(0x1F,0x29,0x37)
MUTED  = RGBColor(0x6B,0x72,0x80)
MALE   = RGBColor(0x1D,0x4E,0xD8)
FEMALE = RGBColor(0xBE,0x18,0x5D)
WHITE  = RGBColor(0xFF,0xFF,0xFF)
CARD_BG= RGBColor(0xF8,0xF7,0xFC)
FAM_BG = {1:RGBColor(0xF5,0xF3,0xFF), 2:RGBColor(0xEC,0xFD,0xF5), 3:RGBColor(0xFF,0xF7,0xED), 4:RGBColor(0xFE,0xF2,0xF7)}
FAM_LINE={1:LILAC, 2:GREEN, 3:RGBColor(0xEA,0x58,0x0C), 4:FEMALE}
FONT = '맑은 고딕'

def sort_st(students):
    return sorted(students, key=lambda t: (-t[1], t[0]))

def runs(p, parts):
    for txt, size, bold, color in parts:
        r = p.add_run(); r.text = txt
        r.font.size = Pt(size); r.font.bold = bold
        r.font.color.rgb = color; r.font.name = FONT

def green_badge(slide, x, y, s):
    sh = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, s, s)
    sh.fill.solid(); sh.fill.fore_color.rgb = GREEN; sh.line.fill.background()
    sh.adjustments[0] = 0.28; sh.shadow.inherit = False
    tf = sh.text_frame; tf.word_wrap = False
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = 'R'
    r.font.size = Pt(int(s / 914400 * 40)); r.font.bold = True
    r.font.color.rgb = WHITE; r.font.name = FONT
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    return sh

def add_title_slide(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid(); bg.fill.fore_color.rgb = DARK; bg.line.fill.background(); bg.shadow.inherit = False
    green_badge(s, Inches(0.9), Inches(2.55), Inches(1.5))
    tb = s.shapes.add_textbox(Inches(2.7), Inches(2.35), Inches(9.6), Inches(2.9))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; runs(p, [('내수동 경주자 ', 46, True, WHITE), ('2026', 46, True, LILAC)])
    p2 = tf.add_paragraph(); p2.space_before = Pt(2); runs(p2, [('4학기 전체 라인업', 32, True, GREEN)])
    total = sum(len(v) for v in CELL_STUDENTS.values())
    p3 = tf.add_paragraph(); p3.space_before = Pt(14)
    runs(p3, [(f'4 대가족 · 10개 반(혼합 6 + 고3 4) · 총 {total}명', 18, False, RGBColor(0xCB,0xD5,0xE1))])
    p4 = tf.add_paragraph(); p4.space_before = Pt(6)
    r = p4.add_run(); r.text = '"나는 선한 싸움을 싸우고 나의 달려갈 길을 마치고" — 딤후 4:7'
    r.font.size = Pt(13); r.font.italic = True; r.font.color.rgb = RGBColor(0x94,0xA3,0xB8); r.font.name = FONT
    ftb = s.shapes.add_textbox(Inches(0.9), Inches(6.9), Inches(11), Inches(0.4))
    fr = ftb.text_frame.paragraphs[0].add_run()
    fr.text = '내수동교회 고등부 · 발행 ' + date.today().strftime('%Y-%m-%d')
    fr.font.size = Pt(11); fr.font.color.rgb = RGBColor(0x6B,0x72,0x80); fr.font.name = FONT

def add_class_slide(prs, cell):
    fam = CELL_FAMILY[cell]
    t = CELL_TEACHERS[cell]
    students = sort_st(CELL_STUDENTS[cell])
    is_g3 = cell.startswith('고3')
    is_leader = FAMILY_LEADERS[fam].startswith(t['homeroom'])

    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid(); bg.fill.fore_color.rgb = WHITE; bg.line.fill.background(); bg.shadow.inherit = False

    # 헤더: 대가족 배지 + 반 이름 + 담당교사
    badge = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.45), Inches(0.42), Inches(1.7), Inches(0.5))
    badge.fill.solid(); badge.fill.fore_color.rgb = FAM_LINE[fam]; badge.line.fill.background()
    badge.adjustments[0] = 0.5; badge.shadow.inherit = False
    btf = badge.text_frame; btf.margin_left = btf.margin_right = btf.margin_top = btf.margin_bottom = 0
    btf.vertical_anchor = MSO_ANCHOR.MIDDLE
    bp = btf.paragraphs[0]; bp.alignment = PP_ALIGN.CENTER
    runs(bp, [(f'대가족 {fam}', 15, True, WHITE)])

    tb = s.shapes.add_textbox(Inches(0.45), Inches(1.0), Inches(8.5), Inches(1.1))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]
    runs(p, [(cell, 40, True, DARK)])
    p2 = tf.add_paragraph(); p2.space_before = Pt(4)
    teacher_parts = [('담임 ' if is_g3 else '교사1 ', 15, True, MUTED), (t['homeroom'], 18, True, INK)]
    if is_leader:
        teacher_parts.append(('  ★가족장', 13, True, FAM_LINE[fam]))
    if not is_g3 and t['sub']:
        teacher_parts += [('    교사2 ', 15, True, MUTED), (t['sub'], 18, True, INK)]
    runs(p2, teacher_parts)

    # 우상단 브랜드 + 인원
    rb = s.shapes.add_textbox(Inches(9.8), Inches(0.5), Inches(3.1), Inches(0.9))
    rtf = rb.text_frame
    rr = rtf.paragraphs[0]; rr.alignment = PP_ALIGN.RIGHT
    rn = rr.add_run(); rn.text = '내수동 경주자 2026'
    rn.font.size = Pt(13); rn.font.bold = True; rn.font.color.rgb = LILAC; rn.font.name = FONT
    rr2 = rtf.add_paragraph(); rr2.alignment = PP_ALIGN.RIGHT
    rn2 = rr2.add_run(); rn2.text = f'{len(students)}명'
    rn2.font.size = Pt(22); rn2.font.bold = True; rn2.font.color.rgb = DARK; rn2.font.name = FONT

    # 학생 카드 그리드 (3열)
    cols = 3
    rows = (len(students) + cols - 1) // cols
    left = Inches(0.45); top = Inches(2.35)
    gap = Inches(0.25)
    grid_w = prs.slide_width - left * 2
    grid_h = prs.slide_height - top - Inches(0.45)
    card_w = (grid_w - gap * (cols - 1)) / cols
    card_h = (grid_h - gap * (rows - 1)) / rows

    for i, (name, grade, gender) in enumerate(students):
        r_i, c_i = divmod(i, cols)
        x = left + c_i * (card_w + gap)
        y = top + r_i * (card_h + gap)
        card = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, card_w, card_h)
        card.fill.solid(); card.fill.fore_color.rgb = FAM_BG[fam]
        card.line.color.rgb = FAM_LINE[fam]; card.line.width = Pt(1)
        card.adjustments[0] = 0.08; card.shadow.inherit = False
        ctf = card.text_frame; ctf.word_wrap = True; ctf.vertical_anchor = MSO_ANCHOR.MIDDLE
        ctf.margin_left = Inches(0.15); ctf.margin_right = Inches(0.1)
        cp = ctf.paragraphs[0]; cp.alignment = PP_ALIGN.LEFT
        runs(cp, [(name, 24, True, INK)])
        cp2 = ctf.add_paragraph(); cp2.space_before = Pt(2)
        runs(cp2, [(f'{grade}학년 ', 14, False, MUTED), (gender, 14, True, MALE if gender == '남' else FEMALE)])

def main():
    prs = Presentation()
    prs.slide_width = Inches(13.333); prs.slide_height = Inches(7.5)
    add_title_slide(prs)
    for cell in CELL_ORDER:
        add_class_slide(prs, cell)
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lineup.pptx')
    prs.save(out)
    print('PPTX 생성 완료:', out, f'({os.path.getsize(out)/1024:.0f} KB, {len(prs.slides._sldIdLst)}장)')

if __name__ == '__main__':
    main()
