<tbody>

  {/* 1. เช็คชื่อ */}

  <tr>

    <td className="text-start fw-bold ps-2 table-light">
      เช็คชื่อ
    </td>

    {daysArray.map((day) => (

      <td key={day}>

        {selectedChild.dailyData?.attendance?.[day] || "-"}

      </td>

    ))}

  </tr>

  {/* 2. ดื่มนม */}

  <tr>

    <td className="text-start fw-bold ps-2 table-light">
      ดื่มนม
    </td>

    {daysArray.map((day) => (

      <td key={day}>

        {selectedChild.dailyData?.milk?.[day] || "-"}

      </td>

    ))}

  </tr>

  {/* 3. รับประทานอาหาร */}

  <tr>

    <td className="text-start fw-bold ps-2 table-light">
      รับประทานอาหาร
    </td>

    {daysArray.map((day) => (

      <td key={day}>

        {selectedChild.dailyData?.lunch?.[day] || "-"}

      </td>

    ))}

  </tr>

  {/* 4. แปรงฟัน */}

  <tr>

    <td className="text-start fw-bold ps-2 table-light">
      แปรงฟัน
    </td>

    {daysArray.map((day) => (

      <td key={day}>

        {selectedChild.dailyData?.toothbrush?.[day] || "-"}

      </td>

    ))}

  </tr>

  {/* 5. สุขภาพ */}

  <tr>

    <td className="text-start fw-bold ps-2 table-light">
      สุขภาพ
    </td>

    {daysArray.map((day) => (

      <td key={day}>

        {selectedChild.dailyData?.health?.[day] || "-"}

      </td>

    ))}

  </tr>

  {/* 6. น้ำหนัก / ส่วนสูง */}

  <tr>

    <td className="text-start fw-bold ps-2 table-light">
      น้ำหนัก/ส่วนสูง
    </td>

    {daysArray.map((day) => {

      const measure =
        selectedChild.dailyData?.measurements?.[day];

      return (

        <td key={day}>

          {measure
            ? `${measure.weight || "-"} / ${measure.height || "-"}` 
            : "-"}

        </td>

      );
    })}

  </tr>

</tbody>