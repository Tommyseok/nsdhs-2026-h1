# -*- coding: utf-8 -*-
"""
내수동 고등부 2026 2학기 셀편성 PDF 생성 (A4 1장, 흑백)
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

# ====== 한글 폰트 등록 ======
WIN_FONTS = r'C:\Windows\Fonts'
pdfmetrics.registerFont(TTFont('Malgun', os.path.join(WIN_FONTS, 'malgun.ttf')))
pdfmetrics.registerFont(TTFont('MalgunBold', os.path.join(WIN_FONTS, 'malgunbd.ttf')))

# ====== 데이터 ======
HOMEROOM = {
    1: '이윤정', 2: '정명경', 3: '전성희', 4: '박대철',
    5: '이수지', 6: '정유빈', 7: '양지현', 8: '이유성',
    9: '오덕현', 10: '최희승', 11: '석준원', 12: '고은솔',
}
SUB = {
    1: '이승헌', 2: '조세경', 3: '',     4: '김희원',
    5: '박해니', 6: '',     7: '송진우', 8: '이규리',
    9: '김주영', 10: '',    11: '',      12: '오은규',
}
# 대가족장: 홀수 소그룹반 담임 겸임
LEADERS = {1: 1, 2: 3, 3: 5, 4: 7, 5: 9, 6: 11}

# 학생 튜플: (이름, 학년, 성별, 라벨)  — 라벨: 'new' / 'rejoin' / 'urgent' / None
CELL_STUDENTS = {
    1:  [('권하율',1,'남',None),('하은유',1,'여',None),('홍기진',2,'남',None),
         ('서이수',3,'여',None),('장지현',2,'여',None),('김은',1,'여','new')],
    2:  [('강은교',2,'여',None),('명주원',3,'남',None),('조인상',3,'여',None),
         ('연해준',2,'남',None),('유나린',2,'여',None)],
    3:  [('박지호',3,'여',None),('한채은',3,'여',None),('김라일',2,'남',None),
         ('안민혁',1,'남',None)],
    4:  [('김준수',3,'남',None),('원대연',2,'남',None),('이준호',2,'남',None),
         ('오현우',1,'남',None),('이빛가온',1,'남',None)],
    5:  [('민예원',2,'여',None),('김도연',2,'여',None),('전지훈',2,'남',None),
         ('최지은',1,'여',None),
         ('김나현',2,'여','rejoin'),('윤서희',2,'여','new')],
    6:  [('조한나',1,'여',None),('김한결',1,'남',None),('이서후',1,'여',None),
         ('임태민',2,'남',None)],
    7:  [('조강인',3,'남',None),('이에녹',3,'남',None),('최민호',2,'남','new'),
         ('김정록',1,'남',None),('정태율',1,'남',None)],
    8:  [('심희은',3,'여',None),('김은우',3,'여',None),('최가은',3,'여',None),
         ('양소희',2,'여',None)],
    9:  [('나정인',3,'여',None),('주성',3,'남','new'),('곽지원',3,'남',None),
         ('양인혁',3,'남',None),('김다은',3,'여',None),('오은수',1,'여',None),
         ('박재영',1,'남','new')],
    10: [('이주형',1,'여',None),('유재희',2,'여',None),('윤성하',1,'남',None),
         ('나호윤',1,'남',None),('이소현',1,'여','new'),('배유나',2,'여','rejoin')],
    11: [('최유현',1,'여',None),('이가영',2,'여',None),('최수지',1,'여',None),
         ('박동하',1,'남',None),('송준원',1,'남',None)],
    12: [('정승빈',3,'여',None),('김주하',2,'여',None),('김채은',2,'여',None),
         ('박지웅',1,'남',None),('김강은',1,'여',None)],
}

SPECIAL = {
    1: [('고예나',1,'여',None),('김민채',3,'여',None),('송성모',3,'남',None),('최승아',3,'여',None)],
    2: [('최지윤',3,'여',None),('최서윤',3,'여',None),('백결',3,'남',None),('조혁준',3,'남',None)],
    3: [('김재원',1,'남','urgent'),('김유진',2,'여',None),('김강희',1,'여',None),('박서연',1,'여',None)],
    4: [('박시우',1,'남','urgent'),('하어림',1,'남',None),('박진서',3,'여',None),('임소명',3,'여',None)],
    5: [('오희수',3,'여',None),('박민주',1,'여',None),('장세민',3,'남',None),('정원영',3,'남',None)],
    6: [('이서현',1,'여',None),('이소민',3,'여',None),('김도헌',3,'남',None),('이하준',1,'남',None)],
}

# 라벨 표시 (PDF용 단축 표기)
LABEL_TEXT = {
    'new':    '[새]',
    'rejoin': '[합류]',
    'urgent': '[즉시접촉]',
}

# 성별 색상
MALE_COLOR = colors.Color(0.118, 0.227, 0.541)   # 진한 파랑
FEMALE_COLOR = colors.Color(0.514, 0.094, 0.262) # 진한 핑크

# 출석률 데이터 (1학기 6/21 기준, %) — None은 신규
ATT = {
    '권하율':89,'하은유':95,'홍기진':95,'서이수':100,'장지현':95,'김은':None,
    '강은교':95,'명주원':95,'조인상':100,'연해준':100,'유나린':100,
    '박지호':79,'한채은':100,'김라일':100,'안민혁':86,
    '김준수':74,'원대연':95,'이준호':26,'오현우':100,'이빛가온':89,
    '민예원':89,'김도연':89,'전지훈':26,'최지은':95,'김나현':0,'윤서희':None,
    '조한나':95,'김한결':89,'이서후':84,'임태민':32,
    '조강인':47,'이에녹':100,'최민호':None,'김정록':100,'정태율':95,
    '심희은':100,'김은우':78,'최가은':74,'양소희':42,
    '나정인':95,'주성':None,'곽지원':42,'양인혁':100,'김다은':84,'오은수':79,'박재영':None,
    '이주형':100,'유재희':89,'윤성하':78,'나호윤':100,'이소현':None,'배유나':5,
    '최유현':84,'이가영':53,'최수지':100,'박동하':32,'송준원':17,
    '정승빈':100,'김주하':47,'김채은':21,'박지웅':95,'김강은':100,
    # Special
    '고예나':11,'김민채':0,'송성모':0,'최승아':0,
    '최지윤':0,'최서윤':0,'백결':5,'조혁준':0,
    '김재원':0,'김유진':0,'김강희':0,'박서연':74,
    '박시우':0,'하어림':0,'박진서':24,'임소명':24,
    '오희수':16,'박민주':0,'장세민':22,'정원영':16,
    '이서현':0,'이소민':11,'김도헌':5,'이하준':0,
}

def att_text(name):
    v = ATT.get(name)
    if v is None:
        return '신규'
    return f'{v}%'

FAMILY_TO_CELLS = {1:(1,2), 2:(3,4), 3:(5,6), 4:(7,8), 5:(9,10), 6:(11,12)}


def sort_students(students):
    """3학년 → 2학년 → 1학년, 같은 학년이면 가나다"""
    return sorted(students, key=lambda s: (-s[1], s[0]))


def chip_parts(s):
    """학생 → (prefix, gender, suffix) 3 부분 분리
    예: ('권하율(1', '남', '·89%)') 또는 ('김재원(1', '남', '·0%)[즉시접촉]')
    """
    n, g, x = s[0], s[1], s[2]
    label = s[3] if len(s) > 3 else None
    prefix = f'{n}({g}'
    gender = x
    suffix = f'·{att_text(n)})'
    if label and label in LABEL_TEXT:
        suffix += LABEL_TEXT[label]
    return prefix, gender, suffix


def chip_width(c, s, font, size):
    prefix, gender, suffix = chip_parts(s)
    return (c.stringWidth(prefix, font, size) +
            c.stringWidth(gender, font, size) +
            c.stringWidth(suffix, font, size))


def draw_chip(c, s, x, y, font, size):
    """학생 칩 하나 그리기. 성별만 색상 적용."""
    prefix, gender, suffix = chip_parts(s)
    c.setFillColor(colors.black)
    c.drawString(x, y, prefix)
    x += c.stringWidth(prefix, font, size)
    if gender == '남':
        c.setFillColor(MALE_COLOR)
    else:
        c.setFillColor(FEMALE_COLOR)
    c.drawString(x, y, gender)
    x += c.stringWidth(gender, font, size)
    c.setFillColor(colors.black)
    c.drawString(x, y, suffix)
    return x + c.stringWidth(suffix, font, size)


def draw_wrapped_chips(c, students, x, y, max_w, font='Malgun', size=7.5, leading=9.5):
    """학생 리스트를 wrap하며 그림 (성별 색상 적용)."""
    if not students:
        return y
    c.setFont(font, size)
    sep = ', '
    sep_w = c.stringWidth(sep, font, size)

    line_students = []
    line_w = 0
    current_y = y

    def render_line(line, draw_y):
        cx = x
        for i, s in enumerate(line):
            if i > 0:
                c.setFillColor(colors.black)
                c.drawString(cx, draw_y, sep)
                cx += sep_w
            cx = draw_chip(c, s, cx, draw_y, font, size)
        c.setFillColor(colors.black)

    for s in students:
        w = chip_width(c, s, font, size)
        add_w = w if not line_students else (sep_w + w)
        if line_w + add_w > max_w and line_students:
            render_line(line_students, current_y)
            current_y -= leading
            line_students = [s]
            line_w = w
        else:
            line_students.append(s)
            line_w += add_w
    if line_students:
        render_line(line_students, current_y)
        current_y -= leading
    return current_y


def draw_cell_section(c, x, y, w, h, cell_id, fam):
    """소그룹반 박스 그리기."""
    # 외곽선
    c.setLineWidth(0.4)
    c.setDash()
    c.rect(x, y, w, h, stroke=1, fill=0)

    pad = 1.5*mm
    top = y + h

    # 소그룹반 이름 + 인원
    students = sort_students(CELL_STUDENTS[cell_id])
    c.setFont('MalgunBold', 9)
    c.drawString(x + pad, top - 4*mm, f'소그룹반 {cell_id}')
    c.setFont('Malgun', 7)
    c.drawRightString(x + w - pad, top - 4*mm, f'{len(students)}명')

    # 담임
    teacher_y = top - 8*mm
    c.setFont('MalgunBold', 7)
    c.drawString(x + pad, teacher_y, '담임')
    c.setFont('Malgun', 8.5)
    name = HOMEROOM[cell_id]
    c.drawString(x + pad + 9*mm, teacher_y, name)
    # 가족장 표시
    if LEADERS[fam] == cell_id:
        name_w = c.stringWidth(name, 'Malgun', 8.5)
        c.setFont('MalgunBold', 6.5)
        c.drawString(x + pad + 9*mm + name_w + 1.5*mm, teacher_y, '★가족장')

    # 부담임
    sub = SUB[cell_id]
    teacher_y -= 3.5*mm
    c.setFont('MalgunBold', 7)
    c.drawString(x + pad, teacher_y, '부담임')
    if sub:
        c.setFont('Malgun', 8.5)
        c.drawString(x + pad + 9*mm, teacher_y, sub)
    else:
        c.setFont('Malgun', 7.5)
        c.drawString(x + pad + 9*mm, teacher_y, '—')

    # 구분선 (담임/학생 사이)
    sep_y = teacher_y - 2*mm
    c.setLineWidth(0.25)
    c.setDash(1, 1.5)
    c.line(x + pad, sep_y, x + w - pad, sep_y)
    c.setDash()

    # 학생 명단
    student_y = sep_y - 3.2*mm
    draw_wrapped_chips(c, students, x + pad, student_y, w - 2*pad, font='Malgun', size=7.5, leading=9.2)


def draw_special_section(c, x, y, w, h, fam):
    """Special 박스 (대시 보더)."""
    c.setLineWidth(0.5)
    c.setDash(2.2, 1.4)
    c.rect(x, y, w, h, stroke=1, fill=0)
    c.setDash()

    pad = 1.5*mm
    top = y + h

    students = sort_students(SPECIAL[fam])
    c.setFont('MalgunBold', 9)
    c.drawString(x + pad, top - 4*mm, f'Special {fam}')
    c.setFont('Malgun', 7)
    c.drawRightString(x + w - pad, top - 4*mm, f'{len(students)}명')

    c.setFont('Malgun', 6.5)
    c.setFont('Malgun', 6)
    note_line1 = '목회자/대가족 소속 교사가 특별케어'
    note_line2 = '(처음 반 맡았을 때 반드시 연락)'
    c.drawString(x + pad, top - 6.5*mm, note_line1)
    c.drawString(x + pad, top - 9*mm, note_line2)
    c.setFont('Malgun', 7.5)

    student_y = top - 11.5*mm
    draw_wrapped_chips(c, students, x + pad, student_y, w - 2*pad, font='Malgun', size=7.5, leading=9.2)


def draw_family_box(c, x, y, w, h, fam):
    """대가족반 박스."""
    # 외곽
    c.setLineWidth(0.8)
    c.setDash()
    c.rect(x, y, w, h, stroke=1, fill=0)

    pad = 2*mm
    top = y + h

    # 헤더 영역 (10mm)
    header_h = 9.5*mm
    header_y = top - header_h

    # 헤더 구분선
    c.setLineWidth(1.0)
    c.line(x, header_y, x + w, header_y)

    # 대가족반 이름
    c.setFont('MalgunBold', 11.5)
    c.drawString(x + pad, header_y + 5*mm, f'대가족반 {fam}')

    # 가족장
    leader_name = HOMEROOM[LEADERS[fam]]
    c.setFont('Malgun', 8)
    c.drawRightString(x + w - pad, header_y + 5*mm, f'★ 가족장 {leader_name}')

    # 인원수
    c1, c2 = FAMILY_TO_CELLS[fam]
    total = len(CELL_STUDENTS[c1]) + len(CELL_STUDENTS[c2]) + len(SPECIAL[fam])
    c.setFont('Malgun', 7.5)
    c.drawRightString(x + w - pad, header_y + 1.8*mm, f'총 {total}명')
    c.drawString(x + pad, header_y + 1.8*mm, '(소그룹 2 + Special 1)')

    # 본문 영역: 소그룹반 2개 + Special 1개 = 3 sections
    body_top = header_y
    body_bottom = y
    body_h = body_top - body_bottom
    section_gap = 1.2*mm

    # 비율: 소그룹반 큰 것 기준으로 동적 할당
    # 학생 많은 셀일수록 더 큰 공간 필요
    cs1_count = len(CELL_STUDENTS[c1])
    cs2_count = len(CELL_STUDENTS[c2])
    sp_count = len(SPECIAL[fam])
    # 베이스 + 학생당 추가 공간 (단순 비례)
    weights = [max(3.5, 3 + cs1_count*0.5),
               max(3.5, 3 + cs2_count*0.5),
               max(3.5, 3 + sp_count*0.5)]
    total_w = sum(weights)

    avail = body_h - 2 * section_gap
    s1_h = avail * weights[0] / total_w
    s2_h = avail * weights[1] / total_w
    sp_h = avail * weights[2] / total_w

    # 소그룹반 1 (헤더 바로 아래)
    s1_y = body_top - s1_h
    draw_cell_section(c, x + pad/2, s1_y, w - pad, s1_h, c1, fam)

    # 소그룹반 2
    s2_y = s1_y - section_gap - s2_h
    draw_cell_section(c, x + pad/2, s2_y, w - pad, s2_h, c2, fam)

    # Special
    sp_y = s2_y - section_gap - sp_h
    draw_special_section(c, x + pad/2, sp_y, w - pad, sp_h, fam)


def main():
    OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assignments.pdf')
    c = canvas.Canvas(OUTPUT, pagesize=A4)
    c.setTitle('내수동 고등부 2026 2학기 편성표')
    c.setAuthor('내수동교회 고등부')

    W, H = A4
    M = 8*mm

    # === 상단 타이틀 ===
    title_y = H - M - 4*mm
    c.setFont('MalgunBold', 14)
    c.drawString(M, title_y - 5*mm, '내수동 고등부 2026 2학기 셀편성표')

    c.setFont('Malgun', 9)
    c.drawString(M, title_y - 10*mm, '6 대가족반 · 12 소그룹반 + 6 Special · 총 86명 · 학생·학부모 공유용')

    # 발행일자
    c.setFont('Malgun', 8)
    today = date.today().strftime('%Y-%m-%d')
    c.drawRightString(W - M, title_y - 5*mm, f'발행 {today}')
    c.drawRightString(W - M, title_y - 10*mm, '내수동교회 고등부')

    # 타이틀 구분선 (두꺼움)
    c.setLineWidth(1.2)
    c.line(M, title_y - 12*mm, W - M, title_y - 12*mm)

    # === 6개 대가족 그리드 (3 col × 2 row) ===
    grid_top = title_y - 14*mm
    grid_bottom = M + 4*mm  # 푸터 영역
    grid_w = W - 2*M
    grid_h = grid_top - grid_bottom

    cols, rows = 3, 2
    gap = 2*mm
    cell_w = (grid_w - gap * (cols - 1)) / cols
    cell_h = (grid_h - gap * (rows - 1)) / rows

    layout = [
        (1, 0, 0), (2, 1, 0), (3, 2, 0),
        (4, 0, 1), (5, 1, 1), (6, 2, 1),
    ]

    for fam, col, row in layout:
        bx = M + col * (cell_w + gap)
        by = grid_top - (row + 1) * cell_h - row * gap
        draw_family_box(c, bx, by, cell_w, cell_h, fam)

    # === 푸터 ===
    c.setFont('Malgun', 7)
    c.setFillColor(colors.grey)
    line1 = '* 학생 표기: 이름(학년·성별·1학기 출석률%)  *★ 가족장: 대가족반 리더  *남(파랑) / 여(핑크)'
    line2 = '* 라벨:  [새] 새신자(첫 출석)   [합류] 정규합류(장결→정규)   [즉시접촉] 선생님이 즉각 접촉하는 것 필요'
    c.drawString(M, M + 4*mm, line1)
    c.drawString(M, M, line2)
    c.setFillColor(colors.black)

    c.showPage()
    c.save()

    print(f'PDF 생성 완료: {OUTPUT}')
    print(f'크기: {os.path.getsize(OUTPUT) / 1024:.1f} KB')


if __name__ == '__main__':
    main()
