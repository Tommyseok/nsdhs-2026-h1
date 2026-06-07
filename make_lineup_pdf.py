# -*- coding: utf-8 -*-
"""
내수동 경주자 2026 · 전체 라인업 (A4 1장, 인쇄용)
- 출석률/내부 라벨 없는 깔끔한 명단 버전
- 6 대가족 → 소그룹반 2 + Special 1, 담임·부담임 + 학생(학년·성별)
출력: lineup.pdf
"""
import os
import sys
from datetime import date
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

sys.stdout.reconfigure(encoding='utf-8')

WIN_FONTS = r'C:\Windows\Fonts'
pdfmetrics.registerFont(TTFont('Malgun', os.path.join(WIN_FONTS, 'malgun.ttf')))
pdfmetrics.registerFont(TTFont('MalgunBold', os.path.join(WIN_FONTS, 'malgunbd.ttf')))

# ====== 데이터 ======
HOMEROOM = {1:'이윤정',2:'정명경',3:'전성희',4:'박대철',5:'이수지',6:'정유빈',
            7:'양지현',8:'이유성',9:'오덕현',10:'최희승',11:'석준원',12:'고은솔'}
SUB = {1:'이승헌',2:'조세경',3:'',4:'김희원',5:'박해니',6:'',
       7:'송진우',8:'이규리',9:'김주영',10:'',11:'',12:'오은규'}
LEADERS = {1:1,2:3,3:5,4:7,5:9,6:11}

# 학생: (이름, 학년, 성별)
CELL_STUDENTS = {
    1:  [('권하율',1,'남'),('하은유',1,'여'),('홍기진',2,'남'),('서이수',3,'여'),('장지현',2,'여'),('김은',1,'여')],
    2:  [('강은교',2,'여'),('명주원',3,'남'),('조인상',3,'여'),('연해준',2,'남'),('유나린',2,'여')],
    3:  [('박지호',3,'여'),('한채은',3,'여'),('김준수',3,'남'),('김라일',2,'남'),('안민혁',1,'남')],
    4:  [('원대연',2,'남'),('이준호',2,'남'),('전지훈',2,'남'),('오현우',1,'남'),('이빛가온',1,'남')],
    5:  [('민예원',2,'여'),('김도연',2,'여'),('최지은',1,'여'),('김나현',2,'여'),('윤서희',2,'여')],
    6:  [('조한나',1,'여'),('김한결',1,'남'),('이서후',1,'여'),('임태민',2,'남'),('박지웅',1,'남')],
    7:  [('조강인',3,'남'),('이에녹',3,'남'),('최민호',2,'남'),('김정록',1,'남'),('정태율',1,'남')],
    8:  [('심희은',3,'여'),('김은우',3,'여'),('최가은',3,'여'),('양소희',2,'여'),('오은수',1,'여')],
    9:  [('나정인',3,'여'),('주성',3,'남'),('곽지원',3,'남'),('양인혁',3,'남'),('김다은',3,'여')],
    10: [('이주형',1,'여'),('윤성하',1,'남'),('나호윤',1,'남'),('이소현',1,'여'),('배유나',2,'여'),('박재영',1,'남')],
    11: [('최유현',1,'여'),('이가영',2,'여'),('최수지',1,'여'),('박동하',1,'남'),('송준원',1,'남')],
    12: [('정승빈',3,'여'),('김주하',2,'여'),('김채은',2,'여'),('유재희',2,'여'),('김강은',1,'여')],
}
SPECIAL = {
    1: [('고예나',1,'여'),('김민채',3,'여'),('송성모',3,'남'),('최승아',3,'여')],
    2: [('최지윤',3,'여'),('최서윤',3,'여'),('백결',3,'남'),('조혁준',3,'남')],
    3: [('김재원',1,'남'),('김유진',2,'여'),('김강희',1,'여'),('박서연',1,'여')],
    4: [('박시우',1,'남'),('하어림',1,'남'),('박진서',3,'여'),('임소명',3,'여')],
    5: [('오희수',3,'여'),('박민주',1,'여'),('장세민',3,'남'),('정원영',3,'남')],
    6: [('이서현',1,'여'),('이소민',3,'여'),('김도헌',3,'남'),('이하준',1,'남')],
}
FAMILY_TO_CELLS = {1:(1,2),2:(3,4),3:(5,6),4:(7,8),5:(9,10),6:(11,12)}

MALE_COLOR = colors.Color(0.118, 0.227, 0.541)
FEMALE_COLOR = colors.Color(0.514, 0.094, 0.262)


def sort_students(students):
    return sorted(students, key=lambda s: (-s[1], s[0]))


def chip_parts(s):
    """이름(학년 + 성별) → (prefix, gender, suffix). 성별만 색상."""
    n, g, x = s[0], s[1], s[2]
    return f'{n}({g}', x, ')'


def chip_width(c, s, font, size):
    p, gd, sf = chip_parts(s)
    return c.stringWidth(p, font, size) + c.stringWidth(gd, font, size) + c.stringWidth(sf, font, size)


def draw_chip(c, s, x, y, font, size):
    p, gd, sf = chip_parts(s)
    c.setFillColor(colors.black); c.drawString(x, y, p); x += c.stringWidth(p, font, size)
    c.setFillColor(MALE_COLOR if gd == '남' else FEMALE_COLOR); c.drawString(x, y, gd); x += c.stringWidth(gd, font, size)
    c.setFillColor(colors.black); c.drawString(x, y, sf)
    return x + c.stringWidth(sf, font, size)


def draw_wrapped_chips(c, students, x, y, max_w, font='Malgun', size=11.5, leading=14):
    if not students:
        return y
    c.setFont(font, size)
    sep = ', '; sep_w = c.stringWidth(sep, font, size)
    line, line_w, cy = [], 0, y

    def render(ln, dy):
        cx = x
        for i, s in enumerate(ln):
            if i > 0:
                c.setFillColor(colors.black); c.drawString(cx, dy, sep); cx += sep_w
            cx = draw_chip(c, s, cx, dy, font, size)
        c.setFillColor(colors.black)

    for s in students:
        w = chip_width(c, s, font, size)
        add = w if not line else (sep_w + w)
        if line_w + add > max_w and line:
            render(line, cy); cy -= leading; line = [s]; line_w = w
        else:
            line.append(s); line_w += add
    if line:
        render(line, cy); cy -= leading
    return cy


def draw_cell_section(c, x, y, w, h, cell_id, fam):
    c.setLineWidth(0.3); c.setStrokeColor(colors.HexColor('#c4b5fd')); c.setDash()
    c.rect(x, y, w, h, stroke=1, fill=0); c.setStrokeColor(colors.black)
    pad = 2*mm; top = y + h
    students = sort_students(CELL_STUDENTS[cell_id])
    c.setFont('MalgunBold', 12); c.drawString(x + pad, top - 5*mm, f'소그룹반 {cell_id}')
    c.setFont('Malgun', 9); c.drawRightString(x + w - pad, top - 5*mm, f'{len(students)}명')
    ty = top - 10.5*mm
    c.setFont('MalgunBold', 9); c.drawString(x + pad, ty, '담임')
    c.setFont('Malgun', 11.5); name = HOMEROOM[cell_id]; c.drawString(x + pad + 12*mm, ty, name)
    if LEADERS[fam] == cell_id:
        nw = c.stringWidth(name, 'Malgun', 11.5); c.setFont('MalgunBold', 8)
        c.drawString(x + pad + 12*mm + nw + 1.8*mm, ty, '★가족장')
    sub = SUB[cell_id]; ty -= 5*mm
    c.setFont('MalgunBold', 9); c.drawString(x + pad, ty, '부담임')
    c.setFont('Malgun', 11.5); c.drawString(x + pad + 12*mm, ty, sub if sub else '—')
    sep_y = ty - 2.4*mm
    c.setLineWidth(0.25); c.setDash(1, 1.5); c.line(x + pad, sep_y, x + w - pad, sep_y); c.setDash()
    draw_wrapped_chips(c, students, x + pad, sep_y - 4.6*mm, w - 2*pad, size=11.5, leading=14)


def draw_special_section(c, x, y, w, h, fam):
    c.setLineWidth(0.4); c.setStrokeColor(colors.HexColor('#fdba74')); c.setDash(2.2, 1.4)
    c.rect(x, y, w, h, stroke=1, fill=0); c.setDash(); c.setStrokeColor(colors.black)
    pad = 2*mm; top = y + h
    students = sort_students(SPECIAL[fam])
    c.setFont('MalgunBold', 12); c.drawString(x + pad, top - 5*mm, '더 자주 보고 싶은 친구들')
    c.setFont('Malgun', 9); c.drawRightString(x + w - pad, top - 5*mm, f'{len(students)}명')
    c.setFont('Malgun', 8); c.drawString(x + pad, top - 8.6*mm, '대가족 선생님이 더 자주 함께해요')
    draw_wrapped_chips(c, students, x + pad, top - 12.6*mm, w - 2*pad, size=11.5, leading=14)


def draw_family_box(c, x, y, w, h, fam):
    c.setFillColor(colors.HexColor('#f5f3ff')); c.setStrokeColor(colors.HexColor('#4c1d95'))
    c.setLineWidth(1.8); c.setDash(); c.rect(x, y, w, h, stroke=1, fill=1)
    c.setLineWidth(0.3); c.setStrokeColor(colors.HexColor('#c4b5fd')); c.rect(x + 1*mm, y + 1*mm, w - 2*mm, h - 2*mm, stroke=1, fill=0)
    c.setStrokeColor(colors.black); c.setFillColor(colors.black)
    pad = 2*mm; top = y + h
    header_h = 10.5*mm; header_y = top - header_h
    c.setLineWidth(1.0); c.line(x, header_y, x + w, header_y)
    c.setFont('MalgunBold', 14); c.drawString(x + pad, header_y + 5.3*mm, f'대가족반 {fam}')
    c.setFont('Malgun', 9.5); c.drawRightString(x + w - pad, header_y + 5.3*mm, f'★ 가족장 {HOMEROOM[LEADERS[fam]]}')
    c1, c2 = FAMILY_TO_CELLS[fam]
    total = len(CELL_STUDENTS[c1]) + len(CELL_STUDENTS[c2]) + len(SPECIAL[fam])
    c.setFont('Malgun', 8.5); c.drawRightString(x + w - pad, header_y + 1.8*mm, f'총 {total}명')
    c.drawString(x + pad, header_y + 1.8*mm, '(소그룹 2 + 보고 싶은 친구들 1)')
    body_top = header_y; body_h = body_top - y; gap = 1.2*mm
    n1, n2, ns = len(CELL_STUDENTS[c1]), len(CELL_STUDENTS[c2]), len(SPECIAL[fam])
    weights = [max(3.5, 3 + n1*0.5), max(3.5, 3 + n2*0.5), max(3.5, 3 + ns*0.5)]
    tw = sum(weights); avail = body_h - 2*gap
    s1_h, s2_h, sp_h = (avail*weights[0]/tw, avail*weights[1]/tw, avail*weights[2]/tw)
    s1_y = body_top - s1_h; draw_cell_section(c, x + pad/2, s1_y, w - pad, s1_h, c1, fam)
    s2_y = s1_y - gap - s2_h; draw_cell_section(c, x + pad/2, s2_y, w - pad, s2_h, c2, fam)
    sp_y = s2_y - gap - sp_h; draw_special_section(c, x + pad/2, sp_y, w - pad, sp_h, fam)


def main():
    OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lineup.pdf')
    c = canvas.Canvas(OUT, pagesize=A4)
    c.setTitle('내수동 경주자 2026 · 전체 라인업'); c.setAuthor('내수동교회 고등부')
    W, H = A4; M = 8*mm
    title_y = H - M - 4*mm

    # 좌측 녹색 R 배지
    c.setFillColor(colors.HexColor('#16a34a')); c.roundRect(M, title_y - 9*mm, 9*mm, 9*mm, 1.6*mm, stroke=0, fill=1)
    c.setFillColor(colors.white); c.setFont('MalgunBold', 11); c.drawCentredString(M + 4.5*mm, title_y - 6.4*mm, 'R')
    c.setFillColor(colors.black)
    c.setFont('MalgunBold', 16.5); c.drawString(M + 11.5*mm, title_y - 5*mm, '내수동 경주자 2026 · 전체 라인업')
    c.setFont('Malgun', 9.5); c.drawString(M + 11.5*mm, title_y - 10.2*mm, '6 대가족반 · 12 소그룹반 + 더 자주 보고 싶은 친구들 · 총 86명 · 담임/부담임 & 명단')

    c.setFont('Malgun', 8); today = date.today().strftime('%Y-%m-%d')
    c.drawRightString(W - M, title_y - 5*mm, f'발행 {today}')
    c.drawRightString(W - M, title_y - 10*mm, '내수동교회 고등부')
    c.setLineWidth(1.2); c.line(M, title_y - 12*mm, W - M, title_y - 12*mm)

    grid_top = title_y - 14*mm; grid_bottom = M + 3*mm
    grid_w = W - 2*M; grid_h = grid_top - grid_bottom
    cols, rows = 3, 2; gap = 2*mm
    cell_w = (grid_w - gap*(cols-1))/cols; cell_h = (grid_h - gap*(rows-1))/rows
    layout = [(1,0,0),(2,1,0),(3,2,0),(4,0,1),(5,1,1),(6,2,1)]
    for fam, col, row in layout:
        bx = M + col*(cell_w+gap); by = grid_top - (row+1)*cell_h - row*gap
        draw_family_box(c, bx, by, cell_w, cell_h, fam)

    c.setFont('Malgun', 7); c.setFillColor(colors.grey)
    c.drawString(M, M, '* 학생 표기: 이름(학년·성별)   * ★가족장: 대가족반 리더   * 남(파랑) / 여(핑크)   * 달려갈 길을 다 달리고 (딤후 4:7)')
    c.setFillColor(colors.black)
    c.showPage(); c.save()
    print('PDF 생성 완료:', OUT)
    print(f'크기: {os.path.getsize(OUT)/1024:.1f} KB')


if __name__ == '__main__':
    main()
