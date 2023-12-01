import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useState } from "react";

const schema = yup.object({
  packageType: yup.string().oneOf(["standart", "document", "letter"]),
  cityFrom: yup
    .string()
    .matches(/^[A-Za-z]+$/, "Invalid city name")
    .required(),
  cityTo: yup
    .string()
    .matches(/^[A-Za-z]+$/, "Invalid city name")
    .required(),
  weight: yup
    .number()
    .max(2000)
    .min(1)
    .positive()
    .when("packageType", {
      is: "standart" || "letter",
      then: (schema) => schema.required(),
    })
    .when("packageType", {
      is: "document",
      then: (schema) => schema.transform((orig, obj) => 1),
    }),
  theBiggestSide: yup
    .number()
    .min(1, "Side cannot be smallet than 1 cm")
    .max(4000, "Side cannot be bigger than 40 meters")
    .positive()
    .round("floor")
    .when("packageType", {
      is: "standart",
      then: (schema) => schema.required(),
    })
    .when("packageType", {
      is: "document",
      then: (schema) => schema.transform((orig, obj) => 35),
    })
    .when("packageType", {
      is: "letter",
      then: (schema) => schema.strip(),
    }),
  price: yup
    .number()
    .default(50)
    .min(50)
    .max(100000)
    .positive()
    .round("trunc")
    .when("packageType", {
      is: "letter",
      then: (schema) => schema.strip(),
    })
    .when("packageType", {
      is: "document",
      then: (schema) => schema.transform((orig, obj) => 500),
    }),
  checkboxes: yup.array(),
});

const additionalServices = {
  standart: [
    "Calling a courier",
    "Delivery by courier",
    "SMS about receipt",
    "Notice of delivery",
    "Return delivery",
  ],
  document: [
    "Return delivery",
    "Notice of delivery",
    "Delivery to the address",
    "Checking the correspondence of the mail attachment to the description of the attachment",
  ],
  letter: ["Notice of delivery"],
};

export default function App() {
  const [packageType, setPackageType] = useState("standart");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const onSubmit = (data) => {
    console.log(data);
  };

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "checkboxes",
  });

  const weight = (
    <div>
      <p>Weight</p>
      <input type="text" {...register("weight")} />
    </div>
  );

  function handlePackageTypeChange(packageType) {
    remove();

    additionalServices[packageType].forEach((el) => {
      append({ value: el, checked: false });
    });
  }

  useEffect(() => handlePackageTypeChange(packageType), [packageType]);

  console.log(errors && errors);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <p>Send from</p>
          <input {...register("cityFrom")} list="cityFrom"></input>
          <datalist id="cityFrom">
            <option value="Zhytomyr">Zhytomyr</option>
            <option value="Kiyv">Kiyv</option>
            <option value="Lviv">Lviv</option>
            <option value="Kherson">Kherson</option>
          </datalist>
        </div>
        <div>
          <p>Send to</p>
          <input {...register("cityTo")} list="cityTo"></input>
          <datalist id="cityTo">
            <option value="Zhytomyr">Zhytomyr</option>
            <option value="Kiyv">Kiyv</option>
            <option value="Lviv">Lviv</option>
            <option value="Kherson">Kherson</option>
          </datalist>
        </div>
        <div>
          <select
            {...register("packageType")}
            onChange={(e) => {
              setPackageType(e.target.value);
            }}
            value={packageType}
          >
            <option value="standart">Standart</option>
            <option value="document">Document</option>
            <option value="letter">Letter</option>
          </select>
        </div>
        <div>
          {packageType === "standart" && (
            <>
              {weight}
              <div>
                <p>The biggets side length</p>
                <input type="text" {...register("theBiggestSide")} />
              </div>
              <div>
                <p>Price of the package</p>
                <input type="text" {...register("price")} />
              </div>
            </>
          )}
          {packageType === "document" && null}
          {packageType === "letter" && weight}
        </div>
        <div>
          {fields.map((field, index) => (
            <div key={field.id}>
              <input
                className="check-box"
                type="checkbox"
                {...register(`checkboxes.${field.id}.${field.value}`)}
                defaultChecked={field.checked}
                onChange={(e) =>
                  update(index, { ...field, checked: e.target.checked })
                }
              />
              <label>{field.value}</label>
            </div>
          ))}
        </div>
        <button>Submit</button>
      </form>
    </>
  );
}
