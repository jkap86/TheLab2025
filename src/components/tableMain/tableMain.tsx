import Search from "../search/search";
import React, { useEffect } from "react";
import "./tableMain.css";

type ClickHandler = (id: string) => void;

type SetPage = (page: number) => void;

type SetSearched = (searched: string) => void;

type TableMainProps = {
  type: number;
  headers: {
    text: JSX.Element | string;
    colspan: number;
    classname?: string;
  }[];
  headers_sort?: {
    text: JSX.Element | string;
    colspan: number;
    classname?: string;
  }[];
  data: {
    id: string;
    search?: { text: string; display: JSX.Element };
    columns: {
      text: string | JSX.Element;
      colspan: number;
      classname: string;
      style?: { [key: string]: string };
    }[];
    secondary?: JSX.Element;
  }[];
  half?: boolean;
  active?: string;
  setActive?: ClickHandler;
  caption?: JSX.Element;
  page?: number;
  setPage?: SetPage;
  search?: {
    searched: string | false;
    setSearched: SetSearched;
    placeholder: string;
  };
  filters1?: JSX.Element[];
  filters2?: JSX.Element[];
};

const PageNumbers = ({
  data,
  page,
  setPage,
}: {
  data: {
    id: string;
    search?: { text: string; display: JSX.Element };
    columns: {
      text: string | JSX.Element;
      colspan: number;
      classname: string;
      style?: { [key: string]: string };
    }[];
    secondary?: JSX.Element;
  }[];
  page: number;
  setPage: SetPage;
}) => {
  return (
    <div className="page_numbers_wrapper">
      <ol className="page_numbers">
        {Array.from(Array(Math.ceil(data?.length / 25 || 0)).keys()).map(
          (key) => {
            return (
              <li
                key={key + 1}
                className={page === key + 1 ? "active" : ""}
                onClick={() => setPage && setPage(key + 1)}
              >
                {key + 1}
              </li>
            );
          }
        )}
      </ol>
    </div>
  );
};

const TableMain = ({
  type,
  headers,
  headers_sort,
  data,
  half,
  active,
  setActive,
  caption,
  page,
  setPage,
  search,
  filters1,
  filters2,
}: TableMainProps) => {
  const body = page
    ? data
        .filter((d) => !search?.searched || d.id === search?.searched)
        .slice((page - 1) * 25, (page - 1) * 25 + 25)
    : data;

  useEffect(() => {
    if (search?.searched) {
      if (setPage) setPage(1);
    }
  }, [search, setPage]);

  return (
    <>
      {search && (
        <div className="searches">
          {filters1 &&
            filters1.map((filter, index) => {
              return <span key={index}>{filter}</span>;
            })}
          {
            <div key={search.placeholder}>
              <Search
                searched={
                  data.find((d) => d.id === search.searched)?.search?.text || ""
                }
                setSearched={search.setSearched}
                options={data
                  .filter((d) => d.search)
                  .map((d) => ({
                    id: d.id,
                    text: d.search?.text || "",
                    display: d.search?.display || <></>,
                  }))}
                placeholder={search.placeholder}
              />
            </div>
          }
          {filters2 &&
            filters2.map((filter, index) => {
              return <span key={index}>{filter}</span>;
            })}
        </div>
      )}
      {page && setPage && data.length > 25 && !search?.searched ? (
        <PageNumbers
          data={data.filter(
            (d) => !search?.searched || d.id === search?.searched
          )}
          page={page}
          setPage={setPage}
        />
      ) : null}
      <table
        className={
          "main " +
          ((half && "half ") || "") +
          (type === 1 ? "one" : type === 2 ? "two" : "three")
        }
      >
        <caption>{caption && caption}</caption>
        <thead className="main_heading">
          {headers_sort && (
            <tr>
              {headers_sort.map((h, index) => {
                return (
                  <th
                    key={index}
                    colSpan={h.colspan}
                    className={"sort_header " + h.classname}
                  >
                    {h.text}
                  </th>
                );
              })}
            </tr>
          )}
          <tr>
            {headers.map((h, index) => {
              return (
                <th
                  key={index}
                  colSpan={h.colspan}
                  className={"main_header " + h.classname}
                >
                  {h.text}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {body.length > 0 ? (
            body.map((row) => {
              return (
                <tr
                  key={row.id}
                  className={active === row.id ? "active-container" : ""}
                >
                  <td
                    colSpan={row.columns.reduce(
                      (acc, cur) => acc + cur.colspan,
                      0
                    )}
                  >
                    <table>
                      <tbody>
                        <tr
                          className={active === row.id ? "active" : ""}
                          onClick={() =>
                            setActive &&
                            (active === row.id
                              ? setActive("")
                              : setActive(row.id))
                          }
                        >
                          {row.columns.map((col, index: number) => {
                            return (
                              <td
                                key={index}
                                colSpan={col.colspan}
                                className={"content " + col.classname}
                                style={col.style}
                              >
                                <div>{col.text}</div>
                              </td>
                            );
                          })}
                        </tr>
                        {active === row.id && (
                          <tr>
                            <td
                              className="secondaryComponent"
                              colSpan={row.columns.reduce(
                                (acc, cur) => acc + cur.colspan,
                                0
                              )}
                            >
                              {row.secondary}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={headers.reduce((acc, cur) => acc + cur.colspan, 0)}>
                <table className="main_content">
                  <tbody>
                    <tr>
                      <td className="content">---</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {page && setPage ? (
        <PageNumbers
          data={data.filter(
            (d) => !search?.searched || d.id === search?.searched
          )}
          page={page}
          setPage={setPage}
        />
      ) : null}
    </>
  );
};

export default TableMain;
